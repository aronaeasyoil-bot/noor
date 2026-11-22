import "server-only";
import { and, eq, ne } from "drizzle-orm";
import type { Database } from "@/lib/db";
import { bookings, notifications, paymentEvents, payments, refunds } from "@/lib/db/schema";
import { audit } from "@/lib/audit";
import type { PaymentProvider, VerifiedEvent } from "./index";

export type ProcessResult = "processed" | "duplicate" | "ignored" | "mismatch" | "unknown_payment" | "double_payment";

/**
 * Applies a verified provider event exactly once.
 * - Replayed events (same event id) are ignored.
 * - A booking is confirmed only if the paid amount and currency match the payment record.
 * - A second successful payment for an already-paid booking is refunded automatically.
 */
export async function processPaymentEvent(db: Database, provider: PaymentProvider, event: VerifiedEvent): Promise<ProcessResult> {
  const inserted = await db
    .insert(paymentEvents)
    .values({ id: event.id, provider: provider.name, type: event.type, payload: event.raw as object })
    .onConflictDoNothing()
    .returning({ id: paymentEvents.id });
  if (inserted.length === 0) return "duplicate";

  if (event.type === "ignored") return "ignored";

  if (event.type === "refund.updated") {
    const [p] = await db.select().from(payments).where(eq(payments.providerPaymentId, event.providerPaymentId)).limit(1);
    if (!p) return "unknown_payment";
    const status = event.amountRefundedMinor >= p.amountMinor ? "refunded" : "partially_refunded";
    await db.update(payments).set({ status, updatedAt: new Date() }).where(eq(payments.id, p.id));
    await db.update(bookings).set({ paymentStatus: status, status: status === "refunded" ? "refunded" : undefined, updatedAt: new Date() }).where(eq(bookings.id, p.bookingId));
    await db.update(refunds).set({ status: "succeeded" }).where(and(eq(refunds.paymentId, p.id), eq(refunds.status, "pending")));
    return "processed";
  }

  const [payment] = await db.select().from(payments).where(eq(payments.id, event.paymentId)).limit(1);
  if (!payment || payment.providerRef !== event.providerRef) return "unknown_payment";

  if (event.type === "payment.failed") {
    if (payment.status === "pending") await db.update(payments).set({ status: "failed", updatedAt: new Date() }).where(eq(payments.id, payment.id));
    return "processed";
  }

  // payment.succeeded
  if (event.amountMinor !== payment.amountMinor || event.currency !== payment.currency) {
    await audit(db, null, "payment.amount_mismatch", "payment", payment.id, { expected: payment.amountMinor, got: event.amountMinor, currency: event.currency });
    await db.update(payments).set({ status: "failed", providerPaymentId: event.providerPaymentId, updatedAt: new Date() }).where(eq(payments.id, payment.id));
    return "mismatch";
  }

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, payment.bookingId)).limit(1);
  if (!booking) return "unknown_payment";

  // Another payment already settled this booking: refund this one.
  const [otherPaid] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.bookingId, booking.id), eq(payments.status, "paid"), ne(payments.id, payment.id)))
    .limit(1);

  await db.update(payments).set({ status: "paid", providerPaymentId: event.providerPaymentId, updatedAt: new Date() }).where(eq(payments.id, payment.id));

  if (otherPaid || booking.paymentStatus === "paid") {
    if (event.providerPaymentId) {
      try {
        const r = await provider.refund(event.providerPaymentId, payment.amountMinor, `dup-${payment.id}`);
        await db.insert(refunds).values({ paymentId: payment.id, amountMinor: payment.amountMinor, status: "pending", providerRef: r.providerRef, reason: "Duplicate payment (automatic)" });
      } catch (err) {
        await db.insert(refunds).values({ paymentId: payment.id, amountMinor: payment.amountMinor, status: "action_required", reason: `Duplicate payment, automatic refund failed: ${String(err).slice(0, 200)}` });
      }
    }
    await audit(db, null, "payment.duplicate", "booking", booking.id, { paymentId: payment.id });
    return "double_payment";
  }

  await db
    .update(bookings)
    .set({ paymentStatus: "paid", status: booking.status === "pending_payment" || booking.status === "requested" ? "confirmed" : booking.status, updatedAt: new Date() })
    .where(eq(bookings.id, booking.id));
  if (booking.userId) {
    await db.insert(notifications).values({
      userId: booking.userId,
      title: `Payment received – ${booking.reference}`,
      body: `Your payment for ${booking.productTitle} was confirmed by the payment provider.`,
      link: `/account/bookings/${booking.reference}`,
    });
  }
  await audit(db, null, "payment.succeeded", "booking", booking.id, { paymentId: payment.id, amount: payment.amountMinor });
  return "processed";
}
