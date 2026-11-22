import "server-only";
import { cache } from "react";
import { and, asc, eq, gte, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { availabilitySlots, products, type Product } from "@/lib/db/schema";

/** Commercial settings (price, status) for the given catalogue slugs. Missing = price on request. */
export const getProducts = cache(async (slugs: string[]): Promise<Map<string, Product>> => {
  const map = new Map<string, Product>();
  const db = await getDb();
  if (!db || slugs.length === 0) return map;
  try {
    const rows = await db.select().from(products).where(inArray(products.slug, slugs));
    for (const r of rows) map.set(r.slug, r);
  } catch (err) {
    console.error("products lookup failed", err);
  }
  return map;
});

export async function getProduct(slug: string): Promise<Product | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0] ?? null;
}

/** A product can be sold online only if active, priced by NOOR staff, and not inactive. */
export function isBookableOnline(p: Product | null | undefined): p is Product & { priceMinor: number } {
  return !!p && p.status === "active" && typeof p.priceMinor === "number" && p.priceMinor > 0;
}

/** Future time slots opened by NOOR staff for a product, with remaining capacity. */
export async function getOpenSlots(slug: string, fromDate: string): Promise<{ id: string; date: string; startTime: string; remaining: number }[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(availabilitySlots)
    .where(and(eq(availabilitySlots.productSlug, slug), gte(availabilitySlots.date, fromDate)))
    .orderBy(asc(availabilitySlots.date), asc(availabilitySlots.startTime))
    .limit(200);
  return rows.map((r) => ({ id: r.id, date: r.date, startTime: r.startTime, remaining: Math.max(0, r.capacity - r.booked) }));
}
