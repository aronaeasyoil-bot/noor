import { getDb } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import { processPaymentEvent } from "@/lib/payments/process";

/** Signed server-to-server payment events. This is the only place where a booking becomes "paid". */
export async function POST(req: Request) {
  const provider = getPaymentProvider();
  const db = await getDb();
  if (!provider || !db) return new Response("Payments not configured", { status: 503 });
  const raw = await req.text();
  let event;
  try {
    event = await provider.verifyWebhook(raw, req.headers);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  try {
    const result = await processPaymentEvent(db, provider, event);
    return Response.json({ received: true, result });
  } catch (err) {
    console.error("webhook processing failed", err);
    // 500 makes the provider retry; the event id dedupe keeps the retry safe.
    return new Response("Processing error", { status: 500 });
  }
}
