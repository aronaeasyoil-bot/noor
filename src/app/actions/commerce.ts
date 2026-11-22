"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { availabilitySlots, bookings, favorites, newsletterSubscribers, notifications, payments, products, quoteRequests } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { findItem } from "@/lib/catalog";
import { computeAmount } from "@/lib/bookings";
import { makeReference } from "@/lib/references";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { opsEmail, sendEmail } from "@/lib/email";
import { getPaymentProvider } from "@/lib/payments";
import { rateLimit } from "@/lib/rate-limit";
import { todayInDubai } from "@/lib/format";
import { headers } from "next/headers";

export type FormState = { ok?: boolean; error?: string; reference?: string; fieldErrors?: Record<string, string> };

function localeOf(fd: FormData): Locale {
  const l = String(fd.get("locale") ?? "en");
  return isLocale(l) ? l : "en";
}

async function ip(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) out[String(i.path[0])] ??= i.message;
  return out;
}

/* ------------------------------------------------------------------ quotes */

const quoteSchema = z.object({
  service: z.string().trim().min(2).max(60),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: z.string().trim().max(40).optional(),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  travellers: z.coerce.number().int().min(1).max(500).optional(),
  budget: z.string().trim().max(60).optional(),
  message: z.string().trim().min(5).max(4000),
  consent: z.literal("on"),
  context: z.string().max(4000).optional(),
});

/** Every service without a live supplier ends here: the request is stored and shown in admin › Quote requests. */
export async function submitQuoteAction(_: FormState, fd: FormData): Promise<FormState> {
  const entries = Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string" && v !== "")) as Record<string, string>;
  if (entries.website) return { ok: true, reference: "NQ-RECEIVED" }; // honeypot
  const parsed = quoteSchema.safeParse(entries);
  if (!parsed.success) return { error: "validation", fieldErrors: fieldErrors(parsed.error) };
  if (!rateLimit(`quote:${await ip()}`, 10, 60 * 60_000)) return { error: "rateLimited" };
  const db = await getDb();
  if (!db) return { error: "unavailable" };
  const user = await getCurrentUser();
  const reference = makeReference("NQ");
  const { name, email, phone, message, service, context, consent: _c, ...details } = parsed.data;
  let ctx: Record<string, unknown> = {};
  if (context) {
    try {
      const v = JSON.parse(context) as unknown;
      if (v && typeof v === "object") ctx = v as Record<string, unknown>;
    } catch {
      /* ignore malformed context */
    }
  }
  await db.insert(quoteRequests).values({
    reference,
    service,
    userId: user?.id ?? null,
    name,
    email,
    phone: phone ?? null,
    message,
    details: { ...details, search: ctx },
    locale: localeOf(fd),
  });
  if (user) {
    await db.insert(notifications).values({ userId: user.id, title: `Quote request ${reference}`, body: `We received your ${service} request.`, link: `/account/quotes` });
  }
  const ops = opsEmail();
  if (ops) await sendEmail({ to: ops, subject: `New quote request ${reference} (${service})`, text: `${name} <${email}> ${phone ?? ""}\n\n${message}\n\n${JSON.stringify({ ...details, search: ctx }, null, 2)}` });
  return { ok: true, reference };
}

/* ---------------------------------------------------------------- bookings */

const bookingSchema = z.object({
  slug: z.string().min(1).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotId: z.string().uuid().optional(),
  adults: z.coerce.number().int().min(1).max(50),
  children: z.coerce.number().int().min(0).max(50).default(0),
  days: z.coerce.number().int().min(1).max(60).default(1),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: z.string().trim().min(6).max(40),
  notes: z.string().trim().max(2000).optional(),
  // transfer / car specifics
  pickup: z.string().trim().max(200).optional(),
  dropoff: z.string().trim().max(200).optional(),
  airport: z.string().max(5).optional(),
  flightNumber: z.string().trim().max(12).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  luggage: z.coerce.number().int().min(0).max(60).optional(),
});

/**
 * Creates a booking for a NOOR-managed product (safari, activity, transfer, car, package).
 * - With a price set by NOOR and a payment provider configured: status "pending_payment", then checkout.
 * - Otherwise: status "requested"; an adviser confirms availability and price.
 * Capacity is reserved atomically when the product uses time slots.
 */
export async function createBookingAction(_: FormState, fd: FormData): Promise<FormState> {
  const locale = localeOf(fd);
  const user = await getCurrentUser();
  if (!user) return { error: "signIn" };
  const entries = Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string" && v !== "")) as Record<string, string>;
  const parsed = bookingSchema.safeParse(entries);
  if (!parsed.success) return { error: "validation", fieldErrors: fieldErrors(parsed.error) };
  const v = parsed.data;
  if (v.date < todayInDubai()) return { error: "validation", fieldErrors: { date: "pastDate" } };
  const item = findItem(v.slug);
  if (!item || item.category === "service") return { error: "validation" };
  if (!rateLimit(`booking:${user.id}`, 20, 60 * 60_000)) return { error: "rateLimited" };
  const db = await getDb();
  if (!db) return { error: "unavailable" };

  const [product] = await db.select().from(products).where(eq(products.slug, v.slug)).limit(1);
  if (product && product.status === "inactive") return { error: "unavailable" };
  const pax = v.adults + v.children;
  if (product && (pax > product.maxPax || pax < product.minPax)) return { error: "validation", fieldErrors: { adults: "capacity" } };

  // Products sold by time slot: when dates are open online a slot is mandatory (capacity control);
  // when none are open yet, the booking is accepted as a request that an adviser confirms.
  let slotRequestOnly = false;
  if (product?.requiresSlot && !v.slotId) {
    const open = await db
      .select({ id: availabilitySlots.id })
      .from(availabilitySlots)
      .where(and(eq(availabilitySlots.productSlug, v.slug), gte(availabilitySlots.date, todayInDubai())))
      .limit(1);
    if (open.length > 0) return { error: "validation", fieldErrors: { slotId: "required" } };
    slotRequestOnly = true;
  }

  const amount = computeAmount(product, v.adults, v.children, v.days);
  const provider = getPaymentProvider();
  const canPay = amount !== null && provider !== null && !slotRequestOnly;
  const reference = makeReference("NB");

  try {
    const booking = await db.transaction(async (tx) => {
      let slotId: string | null = null;
      if (v.slotId) {
        // Atomic capacity check: the update only succeeds if seats remain.
        const updated = await tx
          .update(availabilitySlots)
          .set({ booked: sql`${availabilitySlots.booked} + ${pax}` })
          .where(and(eq(availabilitySlots.id, v.slotId), eq(availabilitySlots.productSlug, v.slug), eq(availabilitySlots.date, v.date), gte(sql`${availabilitySlots.capacity} - ${availabilitySlots.booked}`, pax)))
          .returning({ id: availabilitySlots.id });
        if (updated.length === 0) throw new Error("SOLD_OUT");
        slotId = v.slotId;
      }
      const { slug, date, slotId: _s, adults, children, days, name, email, phone, notes, ...extra } = v;
      const [b] = await tx
        .insert(bookings)
        .values({
          reference,
          userId: user.id,
          contactName: name,
          contactEmail: email,
          contactPhone: phone,
          productType: item.category,
          productSlug: slug,
          productTitle: item.title.en,
          travelDate: date,
          slotId,
          adults,
          children,
          details: { ...extra, days, notes, titleLocalized: item.title[locale] },
          status: canPay ? "pending_payment" : "requested",
          paymentStatus: "unpaid",
          amountMinor: amount,
          currency: "AED",
          locale,
        })
        .returning();
      await tx.insert(notifications).values({ userId: user.id, title: `Booking ${reference}`, body: `${item.title[locale]} – ${date}`, link: `/account/bookings/${reference}` });
      return b;
    });
    if (!booking) return { error: "unavailable" };
    const ops = opsEmail();
    if (ops) await sendEmail({ to: ops, subject: `New booking ${reference}: ${item.title.en}`, text: `${v.name} <${v.email}> ${v.phone}\n${v.date} · ${v.adults}A ${v.children}C\nStatus: ${booking.status}` });
  } catch (err) {
    if (err instanceof Error && err.message === "SOLD_OUT") return { error: "soldOut" };
    console.error("booking failed", err);
    return { error: "unavailable" };
  }
  revalidatePath(`/${locale}/account/bookings`);
  redirect(canPay ? `/${locale}/checkout/${reference}` : `/${locale}/account/bookings/${reference}?new=1`);
}

/** Starts (or resumes) a hosted checkout. Refuses already-paid bookings, so a customer cannot pay twice from the site. */
export async function startCheckoutAction(fd: FormData): Promise<void> {
  const locale = localeOf(fd);
  const reference = String(fd.get("reference") ?? "");
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/account/sign-in`);
  const db = await getDb();
  const provider = getPaymentProvider();
  if (!db || !provider) redirect(`/${locale}/account/bookings/${reference}`);
  const [b] = await db.select().from(bookings).where(and(eq(bookings.reference, reference), eq(bookings.userId, user.id))).limit(1);
  if (!b || b.paymentStatus === "paid" || b.status !== "pending_payment" || !b.amountMinor) redirect(`/${locale}/account/bookings/${reference}`);

  // Reuse a pending attempt created in the last 50 minutes instead of opening a second session.
  const recent = await db
    .select()
    .from(payments)
    .where(and(eq(payments.bookingId, b.id), eq(payments.status, "pending"), gte(payments.createdAt, new Date(Date.now() - 50 * 60_000))))
    .limit(1);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  let url: string;
  const existing = recent[0];
  if (existing?.providerRef && existing.amountMinor === b.amountMinor) {
    const res = await provider.createCheckout({
      paymentId: existing.id,
      bookingReference: b.reference,
      description: `${b.productTitle} – ${b.reference}`,
      amountMinor: existing.amountMinor,
      currency: existing.currency,
      customerEmail: b.contactEmail,
      successUrl: `${base}/${locale}/checkout/${b.reference}/return`,
      cancelUrl: `${base}/${locale}/checkout/${b.reference}`,
      locale,
    });
    url = res.url;
  } else {
    const [p] = await db.insert(payments).values({ bookingId: b.id, provider: provider.name, amountMinor: b.amountMinor, currency: b.currency, status: "pending" }).returning();
    if (!p) redirect(`/${locale}/account/bookings/${reference}`);
    const res = await provider.createCheckout({
      paymentId: p.id,
      bookingReference: b.reference,
      description: `${b.productTitle} – ${b.reference}`,
      amountMinor: p.amountMinor,
      currency: p.currency,
      customerEmail: b.contactEmail,
      successUrl: `${base}/${locale}/checkout/${b.reference}/return`,
      cancelUrl: `${base}/${locale}/checkout/${b.reference}`,
      locale,
    });
    await db.update(payments).set({ providerRef: res.providerRef }).where(eq(payments.id, p.id));
    url = res.url;
  }
  redirect(url);
}

export async function requestCancellationAction(fd: FormData): Promise<void> {
  const locale = localeOf(fd);
  const reference = String(fd.get("reference") ?? "");
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/account/sign-in`);
  const db = await getDb();
  if (db) {
    const [b] = await db.select().from(bookings).where(and(eq(bookings.reference, reference), eq(bookings.userId, user.id))).limit(1);
    if (b && ["requested", "pending_payment", "confirmed"].includes(b.status)) {
      // Unpaid requests are cancelled immediately; paid bookings go to an adviser for the refund decision.
      const next = b.paymentStatus === "paid" ? "cancellation_requested" : "cancelled";
      await db.update(bookings).set({ status: next, cancelledAt: next === "cancelled" ? new Date() : null, updatedAt: new Date() }).where(eq(bookings.id, b.id));
      if (next === "cancelled" && b.slotId) {
        await db.update(availabilitySlots).set({ booked: sql`greatest(0, ${availabilitySlots.booked} - ${b.adults + b.children})` }).where(eq(availabilitySlots.id, b.slotId));
      }
    }
  }
  revalidatePath(`/${locale}/account/bookings/${reference}`);
  redirect(`/${locale}/account/bookings/${reference}?cancel=1`);
}

/* --------------------------------------------------------------- favorites */

export async function toggleFavoriteAction(itemType: string, itemSlug: string): Promise<{ saved: boolean } | { error: "signIn" }> {
  const user = await getCurrentUser();
  if (!user) return { error: "signIn" };
  if (!findItem(itemSlug) && itemType !== "destination") return { saved: false };
  const db = await getDb();
  if (!db) return { saved: false };
  const where = and(eq(favorites.userId, user.id), eq(favorites.itemType, itemType), eq(favorites.itemSlug, itemSlug));
  const existing = await db.select().from(favorites).where(where).limit(1);
  if (existing.length) {
    await db.delete(favorites).where(where);
    return { saved: false };
  }
  await db.insert(favorites).values({ userId: user.id, itemType, itemSlug }).onConflictDoNothing();
  return { saved: true };
}

/* -------------------------------------------------------------- newsletter */

export async function subscribeAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = z.string().trim().toLowerCase().email().max(200).safeParse(fd.get("email"));
  if (!email.success) return { error: "validation" };
  if (!rateLimit(`nl:${await ip()}`, 5, 60 * 60_000)) return { error: "rateLimited" };
  const db = await getDb();
  if (!db) return { error: "unavailable" };
  const r = await db.insert(newsletterSubscribers).values({ email: email.data, locale: localeOf(fd) }).onConflictDoNothing().returning();
  return r.length ? { ok: true } : { ok: true, error: "already" };
}
