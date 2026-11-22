import "server-only";
import { headers } from "next/headers";

/**
 * Absolute origin of the current request (e.g. https://preprod-noor-travel.arona-easyoil.workers.dev),
 * so links in emails, payment redirects and share previews point at the site actually being visited.
 * Falls back to NEXT_PUBLIC_SITE_URL, then localhost.
 */
export async function siteUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // Outside a request (build time).
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
