"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { passwordResets, sessions, users } from "@/lib/db/schema";
import { DUMMY_HASH, hashPassword, randomToken, sha256, verifyPassword } from "@/lib/auth/crypto";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth/session";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

export type AuthState = { error?: "invalid" | "exists" | "rateLimited" | "validation" | "unavailable" | "resetInvalid"; ok?: boolean; fields?: Record<string, string> };

const email = z.string().trim().toLowerCase().email().max(200);
const password = z.string().min(10).max(200);

function localeOf(fd: FormData): Locale {
  const l = String(fd.get("locale") ?? "en");
  return isLocale(l) ? l : "en";
}

/** Only same-site relative paths are accepted as post-login destinations. */
function safeNext(next: FormDataEntryValue | null, locale: Locale): string {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") && !n.includes("\\") ? n : `/${locale}/account`;
}

async function clientKey(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function signInAction(_: AuthState, fd: FormData): Promise<AuthState> {
  const locale = localeOf(fd);
  const parsed = z.object({ email, password: z.string().min(1).max(200) }).safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { error: "invalid" };
  if (!rateLimit(`login:${await clientKey()}`, 10, 10 * 60_000) || !rateLimit(`login:${parsed.data.email}`, 8, 10 * 60_000)) return { error: "rateLimited" };
  const db = await getDb();
  if (!db) return { error: "unavailable" };
  const [user] = await db.select().from(users).where(sql`lower(${users.email}) = ${parsed.data.email}`).limit(1);
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok || user.disabled) return { error: "invalid", fields: { email: parsed.data.email } };
  await createSession(user.id);
  redirect(safeNext(fd.get("next"), locale));
}

export async function registerAction(_: AuthState, fd: FormData): Promise<AuthState> {
  const locale = localeOf(fd);
  const schema = z.object({
    name: z.string().trim().min(2).max(120),
    email,
    phone: z.string().trim().max(40).optional(),
    password,
  });
  const parsed = schema.safeParse({ name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone") || undefined, password: fd.get("password") });
  if (!parsed.success) return { error: "validation", fields: { name: String(fd.get("name") ?? ""), email: String(fd.get("email") ?? "") } };
  if (!rateLimit(`register:${await clientKey()}`, 5, 60 * 60_000)) return { error: "rateLimited" };
  const db = await getDb();
  if (!db) return { error: "unavailable" };
  const [existing] = await db.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${parsed.data.email}`).limit(1);
  if (existing) return { error: "exists", fields: { name: parsed.data.name, email: parsed.data.email } };
  const [created] = await db
    .insert(users)
    .values({ name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone ?? null, passwordHash: await hashPassword(parsed.data.password), locale })
    .returning({ id: users.id });
  if (!created) return { error: "unavailable" };
  await createSession(created.id);
  redirect(safeNext(fd.get("next"), locale));
}

export async function signOutAction(fd: FormData): Promise<void> {
  await destroySession();
  redirect(`/${localeOf(fd)}`);
}

export async function requestResetAction(_: AuthState, fd: FormData): Promise<AuthState> {
  const locale = localeOf(fd);
  const parsed = email.safeParse(fd.get("email"));
  // Same answer whether or not the account exists (no account enumeration).
  if (!parsed.success) return { ok: true };
  if (!rateLimit(`reset:${await clientKey()}`, 5, 60 * 60_000)) return { error: "rateLimited" };
  const db = await getDb();
  if (!db) return { error: "unavailable" };
  const [user] = await db.select({ id: users.id, email: users.email }).from(users).where(sql`lower(${users.email}) = ${parsed.data}`).limit(1);
  if (user) {
    const token = randomToken();
    await db.insert(passwordResets).values({ id: await sha256(token), userId: user.id, expiresAt: new Date(Date.now() + 3_600_000) });
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const link = `${base}/${locale}/account/reset?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "NOOR – password reset",
      text: `Use this link within 1 hour to choose a new password: ${link}\n\nIf you did not ask for this, ignore this email.`,
    });
  }
  return { ok: true };
}

export async function resetPasswordAction(_: AuthState, fd: FormData): Promise<AuthState> {
  const locale = localeOf(fd);
  const token = String(fd.get("token") ?? "");
  const parsed = password.safeParse(fd.get("password"));
  if (!parsed.success) return { error: "validation" };
  const db = await getDb();
  if (!db) return { error: "unavailable" };
  const id = await sha256(token);
  const [row] = await db
    .select()
    .from(passwordResets)
    .where(and(eq(passwordResets.id, id), isNull(passwordResets.usedAt), gt(passwordResets.expiresAt, new Date())))
    .limit(1);
  if (!row) return { error: "resetInvalid" };
  await db.update(users).set({ passwordHash: await hashPassword(parsed.data), updatedAt: new Date() }).where(eq(users.id, row.userId));
  await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, id));
  // Sign out every existing session after a password change.
  await db.delete(sessions).where(eq(sessions.userId, row.userId));
  redirect(`/${locale}/account/sign-in?reset=1`);
}

export async function updateProfileAction(_: AuthState, fd: FormData): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) return { error: "invalid" };
  const parsed = z
    .object({ name: z.string().trim().min(2).max(120), phone: z.string().trim().max(40).optional(), preferredCurrency: z.enum(["AED", "USD", "EUR", "XOF", "GBP"]) })
    .safeParse({ name: fd.get("name"), phone: fd.get("phone") || undefined, preferredCurrency: fd.get("preferredCurrency") ?? "AED" });
  if (!parsed.success) return { error: "validation" };
  const db = await getDb();
  if (!db) return { error: "unavailable" };
  await db.update(users).set({ ...parsed.data, phone: parsed.data.phone ?? null, updatedAt: new Date() }).where(eq(users.id, user.id));
  return { ok: true };
}
