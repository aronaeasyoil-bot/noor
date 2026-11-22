import { refreshRates } from "@/lib/currency";
import { timingSafeEqual } from "@/lib/auth/crypto";

/** Refreshes exchange rates. Called by a Cloudflare Cron Trigger (or manually) with the CRON_SECRET bearer token. */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || !timingSafeEqual(new TextEncoder().encode(auth), new TextEncoder().encode(`Bearer ${secret}`))) return new Response("Forbidden", { status: 403 });
  const r = await refreshRates();
  return Response.json(r, { status: r.ok ? 200 : 502 });
}
