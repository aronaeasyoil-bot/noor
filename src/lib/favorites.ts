import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { favorites } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

/** Slugs the signed-in user saved, as "type:slug". Empty for guests. */
export const getFavoriteKeys = cache(async (): Promise<Set<string>> => {
  const user = await getCurrentUser();
  const db = await getDb();
  if (!user || !db) return new Set();
  const rows = await db.select().from(favorites).where(eq(favorites.userId, user.id));
  return new Set(rows.map((r) => `${r.itemType}:${r.itemSlug}`));
});
