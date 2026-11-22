import "server-only";
import Stripe from "stripe";

/**
 * Payment provider abstraction. NOOR never sees card numbers: customers pay on the provider's
 * hosted page, and a booking is marked paid only from a signed server-to-server event (webhook).
 */
export type CheckoutRequest = {
  paymentId: string;
  bookingReference: string;
  description: string;
  amountMinor: number;
  currency: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  locale: "en" | "fr" | "ar";
};

export type VerifiedEvent =
  | { id: string; type: "payment.succeeded"; paymentId: string; providerRef: string; providerPaymentId: string | null; amountMinor: number; currency: string; raw: unknown }
  | { id: string; type: "payment.failed"; paymentId: string; providerRef: string; raw: unknown }
  | { id: string; type: "refund.updated"; providerPaymentId: string; amountRefundedMinor: number; raw: unknown }
  | { id: string; type: "ignored"; raw: unknown };

export interface PaymentProvider {
  readonly name: string;
  createCheckout(req: CheckoutRequest): Promise<{ providerRef: string; url: string }>;
  verifyWebhook(rawBody: string, headers: Headers): Promise<VerifiedEvent>;
  refund(providerPaymentId: string, amountMinor: number, idempotencyKey: string): Promise<{ providerRef: string; status: string }>;
}

class StripeProvider implements PaymentProvider {
  readonly name = "stripe";
  private stripe: Stripe;
  constructor(secretKey: string, private webhookSecret: string) {
    this.stripe = new Stripe(secretKey, { httpClient: Stripe.createFetchHttpClient() });
  }

  async createCheckout(req: CheckoutRequest) {
    const session = await this.stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: req.customerEmail,
        client_reference_id: req.bookingReference,
        locale: req.locale === "ar" ? "auto" : req.locale,
        line_items: [
          {
            quantity: 1,
            price_data: { currency: req.currency.toLowerCase(), unit_amount: req.amountMinor, product_data: { name: req.description } },
          },
        ],
        metadata: { payment_id: req.paymentId, booking_reference: req.bookingReference },
        payment_intent_data: { metadata: { payment_id: req.paymentId, booking_reference: req.bookingReference } },
        success_url: req.successUrl,
        cancel_url: req.cancelUrl,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      },
      { idempotencyKey: `checkout-${req.paymentId}` },
    );
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { providerRef: session.id, url: session.url };
  }

  async verifyWebhook(rawBody: string, headers: Headers): Promise<VerifiedEvent> {
    const sig = headers.get("stripe-signature");
    if (!sig) throw new Error("Missing signature");
    const event = await this.stripe.webhooks.constructEventAsync(rawBody, sig, this.webhookSecret, undefined, Stripe.createSubtleCryptoProvider());
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const s = event.data.object;
        if (s.payment_status !== "paid") return { id: event.id, type: "ignored", raw: event };
        return {
          id: event.id,
          type: "payment.succeeded",
          paymentId: String(s.metadata?.payment_id ?? ""),
          providerRef: s.id,
          providerPaymentId: typeof s.payment_intent === "string" ? s.payment_intent : (s.payment_intent?.id ?? null),
          amountMinor: s.amount_total ?? 0,
          currency: (s.currency ?? "").toUpperCase(),
          raw: event,
        };
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const s = event.data.object;
        return { id: event.id, type: "payment.failed", paymentId: String(s.metadata?.payment_id ?? ""), providerRef: s.id, raw: event };
      }
      case "charge.refunded": {
        const c = event.data.object;
        const pi = typeof c.payment_intent === "string" ? c.payment_intent : (c.payment_intent?.id ?? "");
        return { id: event.id, type: "refund.updated", providerPaymentId: pi, amountRefundedMinor: c.amount_refunded, raw: event };
      }
      default:
        return { id: event.id, type: "ignored", raw: event };
    }
  }

  async refund(providerPaymentId: string, amountMinor: number, idempotencyKey: string) {
    const r = await this.stripe.refunds.create({ payment_intent: providerPaymentId, amount: amountMinor }, { idempotencyKey });
    return { providerRef: r.id, status: r.status ?? "pending" };
  }
}

let cached: PaymentProvider | null | undefined;

/** The configured provider, or null when no payment credentials are set (bookings then stay "requested"). */
export function getPaymentProvider(): PaymentProvider | null {
  if (cached !== undefined) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;
  cached = key && whsec ? new StripeProvider(key, whsec) : null;
  return cached;
}

export function paymentsEnabled(): boolean {
  return getPaymentProvider() !== null;
}

/** Test hook: lets unit tests inject a fake provider. */
export function __setPaymentProviderForTests(p: PaymentProvider | null) {
  cached = p;
}
