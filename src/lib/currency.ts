import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { exchangeRates } from "@/lib/db/schema";

export const BILLING_CURRENCY = "AED";
export const currencies = ["AED", "USD", "EUR", "XOF", "GBP"] as const;
export type Currency = (typeof currencies)[number];
export const CURRENCY_COOKIE = "noor_currency";

export function isCurrency(v: string | undefined | null): v is Currency {
  return !!v && (currencies as readonly string[]).includes(v);
}

export type RateTable = { rates: Partial<Record<Currency, number>>; date: Date | null; source: string | null };

/** Rates stored by the last refresh (AED → X). Empty table if never refreshed: the site then shows AED only. */
export const getRates = cache(async (): Promise<RateTable> => {
  const db = await getDb();
  if (!db) return { rates: { AED: 1 }, date: null, source: null };
  try {
    const rows = await db.select().from(exchangeRates);
    const rates: RateTable["rates"] = { AED: 1 };
    let date: Date | null = null;
    let source: string | null = null;
    for (const r of rows) {
      if (r.base === BILLING_CURRENCY && isCurrency(r.quote)) {
        rates[r.quote] = Number(r.rate);
        if (!date || r.rateDate < date) date = r.rateDate;
        source = r.source;
      }
    }
    return { rates, date, source };
  } catch {
    return { rates: { AED: 1 }, date: null, source: null };
  }
});

export async function getDisplayCurrency(): Promise<Currency> {
  const v = (await cookies()).get(CURRENCY_COOKIE)?.value;
  return isCurrency(v) ? v : BILLING_CURRENCY;
}

/** Converts an AED amount (in fils) for display. Returns null when no rate is known. */
export function convertMinor(aedMinor: number, to: Currency, table: RateTable): number | null {
  if (to === BILLING_CURRENCY) return aedMinor;
  const rate = table.rates[to];
  if (!rate) return null;
  return Math.round(aedMinor * rate);
}

/**
 * Downloads current AED rates. Default provider: ExchangeRate-API open endpoint (daily, free, attribution required).
 * Override with EXCHANGE_RATE_URL (must return { result, rates: { USD: n, ... }, time_last_update_unix }).
 */
export async function refreshRates(): Promise<{ ok: boolean; message: string }> {
  const db = await getDb();
  if (!db) return { ok: false, message: "Database not configured" };
  const url = process.env.EXCHANGE_RATE_URL ?? "https://open.er-api.com/v6/latest/AED";
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return { ok: false, message: `Provider answered ${res.status}` };
    const json = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_unix?: number };
    if (json.result && json.result !== "success") return { ok: false, message: "Provider error" };
    const rateDate = json.time_last_update_unix ? new Date(json.time_last_update_unix * 1000) : new Date();
    const source = new URL(url).host;
    let count = 0;
    for (const c of currencies) {
      if (c === BILLING_CURRENCY) continue;
      const rate = json.rates?.[c];
      if (typeof rate !== "number" || !(rate > 0)) continue;
      await db
        .insert(exchangeRates)
        .values({ base: BILLING_CURRENCY, quote: c, rate: String(rate), source, rateDate })
        .onConflictDoUpdate({
          target: [exchangeRates.base, exchangeRates.quote],
          set: { rate: String(rate), source, rateDate, fetchedAt: new Date() },
        });
      count++;
    }
    return { ok: count > 0, message: `${count} rates updated` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Network error" };
  }
}
