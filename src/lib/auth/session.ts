import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { sessions, users, type Role, type User } from "@/lib/db/schema";
import { randomToken, sha256 } from "./crypto";
import { can, isStaff, type Permission } from "./roles";
import type { Locale } from "@/lib/i18n/config";

export const SESSION_COOKIE = "noor_session";
const SESSION_DAYS = 30;

export type SessionUser = Pick<User, "id" | "email" | "name" | "phone" | "role" | "locale" | "preferredCurrency">;

export async function createSession(userId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const ua = (await headers()).get("user-agent")?.slice(0, 250) ?? null;
  await db.insert(sessions).values({ id: await sha256(token), userId, expiresAt, userAgent: ua });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    if (db) await db.delete(sessions).where(eq(sessions.id, await sha256(token)));
  }
  jar.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

/** The signed-in user for this request, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  if (!db) return null;
  try {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        role: users.role,
        locale: users.locale,
        preferredCurrency: users.preferredCurrency,
        disabled: users.disabled,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.id, await sha256(token)), gt(sessions.expiresAt, new Date())))
      .limit(1);
    const row = rows[0];
    if (!row || row.disabled) return null;
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      phone: row.phone,
      role: row.role,
      locale: row.locale,
      preferredCurrency: row.preferredCurrency,
    };
  } catch (err) {
    console.error("session lookup failed", err);
    return null;
  }
});

export async function requireUser(locale: Locale, next?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/account/sign-in${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return user;
}

/** Redirects unless the signed-in user holds the permission. Use in every admin page and action. */
export async function requirePermission(permission: Permission): Promise<SessionUser & { role: Role }> {
  const user = await getCurrentUser();
  if (!user) redirect(`/en/account/sign-in?next=/admin`);
  if (!can(user.role, permission)) redirect("/admin/forbidden");
  return user;
}

export async function requireStaff(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/en/account/sign-in?next=/admin`);
  if (!isStaff(user.role)) redirect("/admin/forbidden");
  return user;
}
