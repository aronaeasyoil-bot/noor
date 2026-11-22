"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { requireDb } from "@/lib/db";
import { availabilitySlots, bookings, kbArticles, payments, products, promotions, quoteRequests, refunds, reviews, suppliers, users, visaApplications, notifications } from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { allCatalogItems } from "@/lib/catalog";
import { getPaymentProvider } from "@/lib/payments";
import { refreshRates } from "@/lib/currency";
import { sendEmail } from "@/lib/email";

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};
const uuid = z.string().uuid();

/* ---------------------------------------------------------------- products */

const productSchema = z.object({
  slug: z.string().min(1),
  status: z.enum(["draft", "active", "inactive"]),
  price: z.string().regex(/^\d{0,7}(\.\d{1,2})?$/),
  priceUnit: z.enum(["per_person", "per_vehicle", "per_group", "per_day"]),
  minPax: z.coerce.number().int().min(1).max(500),
  maxPax: z.coerce.number().int().min(1).max(500),
  requiresSlot: z.boolean(),
  cancellationPolicy: z.string().max(2000),
});

/** Sets the commercial settings of a catalogue item. Prices are entered in AED; empty = price on request. */
export async function saveProductAction(fd: FormData) {
  const user = await requirePermission("productsPricing");
  const p = productSchema.safeParse({
    slug: str(fd, "slug"),
    status: str(fd, "status"),
    price: str(fd, "price"),
    priceUnit: str(fd, "priceUnit"),
    minPax: str(fd, "minPax") || 1,
    maxPax: str(fd, "maxPax") || 20,
    requiresSlot: fd.get("requiresSlot") === "on",
    cancellationPolicy: str(fd, "cancellationPolicy"),
  });
  if (!p.success) redirect(`/admin/products?error=validation`);
  const item = allCatalogItems.find((i) => i.slug === p.data.slug);
  if (!item) redirect(`/admin/products?error=unknown`);
  const db = await requireDb();
  const [existing] = await db.select().from(products).where(eq(products.slug, p.data.slug)).limit(1);
  // Suppliers may only edit products attached to their own supplier account.
  if (user.role === "supplier") {
    const [u] = await db.select({ supplierId: users.supplierId }).from(users).where(eq(users.id, user.id)).limit(1);
    if (!existing || !u?.supplierId || existing.supplierId !== u.supplierId) redirect("/admin/forbidden");
  }
  const priceMinor = p.data.price ? Math.round(Number(p.data.price) * 100) : null;
  const values = {
    status: p.data.status,
    priceMinor: priceMinor && priceMinor > 0 ? priceMinor : null,
    priceUnit: p.data.priceUnit,
    minPax: p.data.minPax,
    maxPax: Math.max(p.data.minPax, p.data.maxPax),
    requiresSlot: p.data.requiresSlot,
    cancellationPolicy: p.data.cancellationPolicy || null,
    updatedAt: new Date(),
  };
  await db
    .insert(products)
    .values({ slug: item.slug, category: item.category, ...values })
    .onConflictDoUpdate({ target: products.slug, set: values });
  await audit(db, user.id, "product.saved", "product", item.slug, { before: existing ?? null, after: values });
  revalidatePath("/", "layout");
  redirect(`/admin/products?saved=${item.slug}#${item.slug}`);
}

export async function addSlotsAction(fd: FormData) {
  const user = await requirePermission("products");
  const p = z
    .object({
      slug: z.string().min(1),
      from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      times: z.string().regex(/^(\d{2}:\d{2})(,\s*\d{2}:\d{2})*$/),
      capacity: z.coerce.number().int().min(1).max(1000),
    })
    .safeParse({ slug: str(fd, "slug"), from: str(fd, "from"), to: str(fd, "to"), times: str(fd, "times"), capacity: str(fd, "capacity") });
  if (!p.success || p.data.to < p.data.from) redirect(`/admin/availability?error=validation`);
  const db = await requireDb();
  const [prod] = await db.select().from(products).where(eq(products.slug, p.data.slug)).limit(1);
  if (!prod) redirect(`/admin/availability?error=noproduct`);
  const times = p.data.times.split(",").map((t) => t.trim());
  const rows: { productSlug: string; date: string; startTime: string; capacity: number }[] = [];
  for (let d = new Date(`${p.data.from}T00:00:00Z`); d <= new Date(`${p.data.to}T00:00:00Z`) && rows.length < 2000; d.setUTCDate(d.getUTCDate() + 1)) {
    for (const t of times) rows.push({ productSlug: p.data.slug, date: d.toISOString().slice(0, 10), startTime: t, capacity: p.data.capacity });
  }
  if (rows.length) await db.insert(availabilitySlots).values(rows).onConflictDoNothing();
  await audit(db, user.id, "slots.added", "product", p.data.slug, { count: rows.length });
  revalidatePath("/admin/availability");
  redirect(`/admin/availability?slug=${p.data.slug}&added=${rows.length}`);
}

export async function removeSlotAction(fd: FormData) {
  const user = await requirePermission("products");
  const id = uuid.safeParse(str(fd, "id"));
  if (!id.success) return;
  const db = await requireDb();
  // A slot with bookings cannot be removed (it would orphan customers' reservations).
  await db.delete(availabilitySlots).where(and(eq(availabilitySlots.id, id.data), eq(availabilitySlots.booked, 0)));
  await audit(db, user.id, "slot.removed", "slot", id.data, {});
  revalidatePath("/admin/availability");
}

/* ---------------------------------------------------------------- bookings */

const bookingStatuses = ["requested", "pending_payment", "confirmed", "cancellation_requested", "cancelled", "refunded", "failed"] as const;

export async function updateBookingAction(fd: FormData) {
  const user = await requirePermission("bookingsWrite");
  const id = uuid.safeParse(str(fd, "id"));
  const status = z.enum(bookingStatuses).safeParse(str(fd, "status"));
  if (!id.success || !status.success) return;
  const db = await requireDb();
  const [b] = await db.select().from(bookings).where(eq(bookings.id, id.data)).limit(1);
  if (!b) return;
  const amount = str(fd, "amount");
  const amountMinor = amount ? Math.round(Number(amount) * 100) : b.amountMinor;
  // Staff can never mark a booking as paid by hand: "paid" only comes from the provider webhook.
  if (status.data === "confirmed" && b.amountMinor && b.paymentStatus !== "paid" && fd.get("confirmUnpaid") !== "on") {
    redirect(`/admin/bookings/${b.reference}?error=unpaid`);
  }
  await db
    .update(bookings)
    .set({
      status: status.data,
      amountMinor: Number.isFinite(amountMinor) && (amountMinor ?? 0) > 0 ? amountMinor : null,
      supplierReference: str(fd, "supplierReference") || b.supplierReference,
      internalNotes: str(fd, "internalNotes") || b.internalNotes,
      cancelledAt: status.data === "cancelled" ? new Date() : b.cancelledAt,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, b.id));
  if (status.data === "cancelled" && b.slotId && b.status !== "cancelled") {
    await db.update(availabilitySlots).set({ booked: sql`greatest(0, ${availabilitySlots.booked} - ${b.adults + b.children})` }).where(eq(availabilitySlots.id, b.slotId));
  }
  if (b.userId && status.data !== b.status) {
    await db.insert(notifications).values({ userId: b.userId, title: `Booking ${b.reference}`, body: `Status: ${status.data.replace("_", " ")}`, link: `/account/bookings/${b.reference}` });
    await sendEmail({ to: b.contactEmail, subject: `NOOR – booking ${b.reference}`, text: `Your booking ${b.reference} (${b.productTitle}) is now: ${status.data.replace("_", " ")}.` });
  }
  await audit(db, user.id, "booking.updated", "booking", b.id, { from: b.status, to: status.data, amountMinor });
  revalidatePath(`/admin/bookings/${b.reference}`);
  redirect(`/admin/bookings/${b.reference}?saved=1`);
}

/* ------------------------------------------------------------------ quotes */

export async function updateQuoteAction(fd: FormData) {
  const user = await requirePermission("quotes");
  const id = uuid.safeParse(str(fd, "id"));
  const status = z.enum(["new", "in_progress", "quoted", "closed"]).safeParse(str(fd, "status"));
  if (!id.success || !status.success) return;
  const db = await requireDb();
  await db.update(quoteRequests).set({ status: status.data, internalNotes: str(fd, "internalNotes") || null, assignedTo: user.id, updatedAt: new Date() }).where(eq(quoteRequests.id, id.data));
  await audit(db, user.id, "quote.updated", "quote", id.data, { status: status.data });
  revalidatePath("/admin/quotes");
}

/* ------------------------------------------------------------------- visas */

export async function updateVisaAction(fd: FormData) {
  const user = await requirePermission("visas");
  const id = uuid.safeParse(str(fd, "id"));
  const status = z.enum(["submitted", "documents_required", "in_review", "submitted_to_authority", "approved", "rejected", "cancelled"]).safeParse(str(fd, "status"));
  if (!id.success || !status.success) return;
  const db = await requireDb();
  const [v] = await db.select().from(visaApplications).where(eq(visaApplications.id, id.data)).limit(1);
  if (!v) return;
  await db.update(visaApplications).set({ status: status.data, statusNote: str(fd, "statusNote") || null, updatedAt: new Date() }).where(eq(visaApplications.id, v.id));
  await db.insert(notifications).values({ userId: v.userId, title: `Visa ${v.reference}`, body: `Status: ${status.data.replace(/_/g, " ")}`, link: "/account/visas" });
  await audit(db, user.id, "visa.updated", "visa", v.id, { from: v.status, to: status.data });
  revalidatePath("/admin/visas");
}

/* ---------------------------------------------------------------- refunds */

export async function createRefundAction(fd: FormData) {
  const user = await requirePermission("refunds");
  const id = uuid.safeParse(str(fd, "paymentId"));
  const amount = Math.round(Number(str(fd, "amount")) * 100);
  if (!id.success || !Number.isFinite(amount) || amount <= 0) redirect("/admin/payments?error=validation");
  const db = await requireDb();
  const [p] = await db.select().from(payments).where(eq(payments.id, id.data)).limit(1);
  if (!p || !p.providerPaymentId || p.status !== "paid" && p.status !== "partially_refunded" || amount > p.amountMinor) redirect("/admin/payments?error=refund");
  const provider = getPaymentProvider();
  if (!provider) redirect("/admin/payments?error=provider");
  const [r] = await db.insert(refunds).values({ paymentId: p.id, amountMinor: amount, status: "pending", reason: str(fd, "reason") || null, createdBy: user.id }).returning();
  try {
    const res = await provider.refund(p.providerPaymentId, amount, `refund-${r!.id}`);
    await db.update(refunds).set({ providerRef: res.providerRef, status: res.status === "succeeded" ? "succeeded" : "pending" }).where(eq(refunds.id, r!.id));
  } catch (err) {
    await db.update(refunds).set({ status: "failed", reason: `${str(fd, "reason")} – ${String(err).slice(0, 150)}` }).where(eq(refunds.id, r!.id));
  }
  await audit(db, user.id, "refund.created", "payment", p.id, { amount });
  redirect("/admin/refunds");
}

/* ------------------------------------------------------------- promotions */

export async function savePromotionAction(fd: FormData) {
  const user = await requirePermission("promotions");
  const p = z
    .object({ code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,30}$/), description: z.string().trim().min(3).max(300), percentOff: z.coerce.number().int().min(0).max(90).optional(), validTo: z.string().optional() })
    .safeParse({ code: str(fd, "code"), description: str(fd, "description"), percentOff: str(fd, "percentOff") || undefined, validTo: str(fd, "validTo") || undefined });
  if (!p.success) redirect("/admin/promotions?error=validation");
  const db = await requireDb();
  const values = { description: p.data.description, percentOff: p.data.percentOff ?? null, validTo: p.data.validTo ? new Date(`${p.data.validTo}T23:59:59+04:00`) : null, active: fd.get("active") === "on" };
  await db.insert(promotions).values({ code: p.data.code, ...values }).onConflictDoUpdate({ target: promotions.code, set: values });
  await audit(db, user.id, "promotion.saved", "promotion", p.data.code, values);
  revalidatePath("/", "layout");
  redirect("/admin/promotions");
}

/* ---------------------------------------------------------------- content */

export async function saveKbAction(fd: FormData) {
  const user = await requirePermission("content");
  const p = z
    .object({ id: z.string().uuid().optional(), locale: z.enum(["en", "fr", "ar"]), question: z.string().trim().min(3).max(300), answer: z.string().trim().min(3).max(4000), keywords: z.string().trim().max(300) })
    .safeParse({ id: str(fd, "id") || undefined, locale: str(fd, "locale"), question: str(fd, "question"), answer: str(fd, "answer"), keywords: str(fd, "keywords") });
  if (!p.success) redirect("/admin/content?error=validation");
  const db = await requireDb();
  const { id, ...v } = p.data;
  if (id) await db.update(kbArticles).set({ ...v, published: fd.get("published") === "on" }).where(eq(kbArticles.id, id));
  else await db.insert(kbArticles).values({ ...v, published: true });
  await audit(db, user.id, "kb.saved", "kb", id ?? "new", { question: v.question });
  redirect("/admin/content");
}

export async function moderateReviewAction(fd: FormData) {
  const user = await requirePermission("content");
  const id = uuid.safeParse(str(fd, "id"));
  const status = z.enum(["published", "rejected"]).safeParse(str(fd, "status"));
  if (!id.success || !status.success) return;
  const db = await requireDb();
  await db.update(reviews).set({ status: status.data }).where(eq(reviews.id, id.data));
  await audit(db, user.id, "review.moderated", "review", id.data, { status: status.data });
  revalidatePath("/admin/content");
}

/* -------------------------------------------------------------- suppliers */

export async function saveSupplierAction(fd: FormData) {
  const user = await requirePermission("suppliers");
  const p = z
    .object({ name: z.string().trim().min(2).max(120), kind: z.enum(["flights", "hotels", "cars", "transfers", "activities", "visa", "other"]), contactEmail: z.string().email().optional(), contactPhone: z.string().max(40).optional(), notes: z.string().max(2000).optional() })
    .safeParse({ name: str(fd, "name"), kind: str(fd, "kind"), contactEmail: str(fd, "contactEmail") || undefined, contactPhone: str(fd, "contactPhone") || undefined, notes: str(fd, "notes") || undefined });
  if (!p.success) redirect("/admin/suppliers?error=validation");
  const db = await requireDb();
  const [s] = await db.insert(suppliers).values({ ...p.data, contactEmail: p.data.contactEmail ?? null, contactPhone: p.data.contactPhone ?? null, notes: p.data.notes ?? null }).returning();
  await audit(db, user.id, "supplier.created", "supplier", s?.id ?? "", p.data);
  redirect("/admin/suppliers");
}

/* ------------------------------------------------------- users & settings */

export async function setUserRoleAction(fd: FormData) {
  const user = await requirePermission("users");
  const id = uuid.safeParse(str(fd, "id"));
  const role = z.enum(["customer", "super_admin", "admin", "booking_agent", "support_agent", "finance", "supplier"]).safeParse(str(fd, "role"));
  if (!id.success || !role.success || id.data === user.id) redirect("/admin/customers?error=role");
  const supplierId = uuid.safeParse(str(fd, "supplierId"));
  const db = await requireDb();
  await db
    .update(users)
    .set({ role: role.data, supplierId: role.data === "supplier" && supplierId.success ? supplierId.data : null, disabled: fd.get("disabled") === "on", updatedAt: new Date() })
    .where(eq(users.id, id.data));
  await audit(db, user.id, "user.role", "user", id.data, { role: role.data });
  revalidatePath("/admin/customers");
}

export async function refreshRatesAction() {
  const user = await requirePermission("settings");
  const r = await refreshRates();
  const db = await requireDb();
  await audit(db, user.id, "rates.refresh", "exchange_rates", "AED", r);
  redirect(`/admin/settings?rates=${r.ok ? "ok" : "failed"}`);
}
