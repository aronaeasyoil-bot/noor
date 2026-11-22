/**
 * Payment processing against a real PostgreSQL database (TEST_DATABASE_URL, migrated).
 * Covers: replayed webhook, amount mismatch, confirmation, duplicate payment refund.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import { processPaymentEvent } from "@/lib/payments/process";
import type { PaymentProvider, VerifiedEvent } from "@/lib/payments";

const url = process.env.TEST_DATABASE_URL;
const d = url ? describe : describe.skip;

d("processPaymentEvent", () => {
  const client = postgres(url ?? "postgres://invalid", { max: 1, onnotice: () => {} });
  const db = drizzle(client, { schema });
  const refundsCalled: string[] = [];
  const provider: PaymentProvider = {
    name: "fake",
    createCheckout: async () => ({ providerRef: "x", url: "https://pay.test" }),
    verifyWebhook: async () => ({ id: "x", type: "ignored", raw: {} }),
    refund: async (pi, _amount, key) => {
      refundsCalled.push(`${pi}:${key}`);
      return { providerRef: `re_${pi}`, status: "pending" };
    },
  };
  let bookingId = "";
  let p1 = "";
  let p2 = "";

  beforeAll(async () => {
    await migrate(db, { migrationsFolder: "drizzle" });
    await db.execute(`truncate payment_events, refunds, payments, notifications, audit_log, bookings, users cascade` as never);
    const [u] = await db.insert(schema.users).values({ email: `t${Date.now()}@noor.test`, name: "Test", passwordHash: "x" }).returning();
    const [b] = await db
      .insert(schema.bookings)
      .values({ reference: "NB-TEST01", userId: u!.id, contactName: "T", contactEmail: "t@noor.test", contactPhone: "+971", productType: "safari", productSlug: "evening-desert-safari", productTitle: "Evening", status: "pending_payment", amountMinor: 50000, currency: "AED", details: {} })
      .returning();
    bookingId = b!.id;
    const [a, c] = await db
      .insert(schema.payments)
      .values([
        { bookingId, provider: "fake", providerRef: "cs_1", amountMinor: 50000, currency: "AED" },
        { bookingId, provider: "fake", providerRef: "cs_2", amountMinor: 50000, currency: "AED" },
      ])
      .returning();
    p1 = a!.id;
    p2 = c!.id;
  });
  afterAll(async () => {
    await client.end();
  });

  const paid = (id: string, paymentId: string, ref: string, amount = 50000, currency = "AED"): VerifiedEvent => ({ id, type: "payment.succeeded", paymentId, providerRef: ref, providerPaymentId: `pi_${ref}`, amountMinor: amount, currency, raw: {} });

  it("refuses a payment whose amount does not match", async () => {
    expect(await processPaymentEvent(db, provider, paid("evt_bad", p1, "cs_1", 100))).toBe("mismatch");
    const [b] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, bookingId));
    expect(b!.paymentStatus).toBe("unpaid");
    await db.update(schema.payments).set({ status: "pending" }).where(eq(schema.payments.id, p1));
  });

  it("rejects an event whose session does not belong to the payment", async () => {
    expect(await processPaymentEvent(db, provider, paid("evt_wrong", p1, "cs_other"))).toBe("unknown_payment");
  });

  it("confirms the booking from a verified event", async () => {
    expect(await processPaymentEvent(db, provider, paid("evt_ok", p1, "cs_1"))).toBe("processed");
    const [b] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, bookingId));
    expect(b!.paymentStatus).toBe("paid");
    expect(b!.status).toBe("confirmed");
  });

  it("ignores a replayed event", async () => {
    expect(await processPaymentEvent(db, provider, paid("evt_ok", p1, "cs_1"))).toBe("duplicate");
  });

  it("refunds a second payment for the same booking", async () => {
    expect(await processPaymentEvent(db, provider, paid("evt_dup", p2, "cs_2"))).toBe("double_payment");
    expect(refundsCalled).toContain(`pi_cs_2:dup-${p2}`);
    const rs = await db.select().from(schema.refunds).where(eq(schema.refunds.paymentId, p2));
    expect(rs).toHaveLength(1);
  });

  it("marks the booking refunded when the provider reports a full refund", async () => {
    expect(await processPaymentEvent(db, provider, { id: "evt_ref", type: "refund.updated", providerPaymentId: "pi_cs_1", amountRefundedMinor: 50000, raw: {} })).toBe("processed");
    const [b] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, bookingId));
    expect(b!.paymentStatus).toBe("refunded");
  });
});
