"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { notifications, travellers } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { isLocale } from "@/lib/i18n/config";

const loc = (fd: FormData) => {
  const l = String(fd.get("locale") ?? "en");
  return isLocale(l) ? l : "en";
};

export async function addTravellerAction(fd: FormData): Promise<void> {
  const user = await getCurrentUser();
  const db = await getDb();
  if (!user || !db) return;
  const p = z
    .object({
      firstName: z.string().trim().min(1).max(80),
      lastName: z.string().trim().min(1).max(80),
      dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      nationality: z.string().trim().max(80).optional(),
    })
    .safeParse({ firstName: fd.get("firstName"), lastName: fd.get("lastName"), dateOfBirth: fd.get("dateOfBirth") || undefined, nationality: fd.get("nationality") || undefined });
  if (!p.success) return;
  await db.insert(travellers).values({ userId: user.id, ...p.data, dateOfBirth: p.data.dateOfBirth ?? null, nationality: p.data.nationality ?? null });
  revalidatePath(`/${loc(fd)}/account/travellers`);
}

export async function removeTravellerAction(fd: FormData): Promise<void> {
  const user = await getCurrentUser();
  const db = await getDb();
  const id = String(fd.get("id") ?? "");
  if (!user || !db || !/^[0-9a-f-]{36}$/.test(id)) return;
  await db.delete(travellers).where(and(eq(travellers.id, id), eq(travellers.userId, user.id)));
  revalidatePath(`/${loc(fd)}/account/travellers`);
}

export async function markNotificationsReadAction(fd: FormData): Promise<void> {
  const user = await getCurrentUser();
  const db = await getDb();
  if (!user || !db) return;
  await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));
  revalidatePath(`/${loc(fd)}/account/notifications`);
}
