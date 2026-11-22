"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { notifications, visaApplications, visaDocuments } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { makeReference } from "@/lib/references";
import { isLocale } from "@/lib/i18n/config";
import { putPrivate, sniffType } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";
import { opsEmail, sendEmail } from "@/lib/email";

export type VisaState = { error?: "signIn" | "validation" | "file" | "unavailable" | "rateLimited" };

const MAX = 8 * 1024 * 1024;
const kinds = ["passport", "photo", "ticket", "hotel", "other"] as const;

const schema = z.object({
  applicantName: z.string().trim().min(2).max(120),
  nationality: z.string().trim().min(2).max(80),
  residence: z.string().trim().max(80).optional(),
  destination: z.string().trim().min(2).max(80),
  visaType: z.enum(["tourist30", "tourist60", "transit", "business", "other"]),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  message: z.string().trim().max(2000).optional(),
});

/** Creates a visa application and stores its documents privately (R2 / local storage). */
export async function submitVisaAction(_: VisaState, fd: FormData): Promise<VisaState> {
  const l = String(fd.get("locale") ?? "en");
  const locale = isLocale(l) ? l : "en";
  const user = await getCurrentUser();
  if (!user) return { error: "signIn" };
  const fields = Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string" && v !== ""));
  const parsed = schema.safeParse(fields);
  if (!parsed.success) return { error: "validation" };
  if (!rateLimit(`visa:${user.id}`, 10, 60 * 60_000)) return { error: "rateLimited" };

  const files: { kind: string; file: File; data: ArrayBuffer; type: string }[] = [];
  for (const k of kinds) {
    for (const f of fd.getAll(`doc_${k}`)) {
      if (!(f instanceof File) || f.size === 0) continue;
      if (f.size > MAX) return { error: "file" };
      const data = await f.arrayBuffer();
      const type = sniffType(data);
      if (!type) return { error: "file" };
      files.push({ kind: k, file: f, data, type });
    }
  }
  if (files.length > 12) return { error: "file" };

  const db = await getDb();
  if (!db) return { error: "unavailable" };
  const reference = makeReference("NV");
  try {
    const [app] = await db.insert(visaApplications).values({ ...parsed.data, residence: parsed.data.residence ?? null, travelDate: parsed.data.travelDate ?? null, message: parsed.data.message ?? null, reference, userId: user.id }).returning();
    if (!app) return { error: "unavailable" };
    for (const f of files) {
      const ext = f.type === "application/pdf" ? "pdf" : f.type === "image/png" ? "png" : "jpg";
      const key = `visa/${app.id}/${crypto.randomUUID()}.${ext}`;
      await putPrivate(key, f.data, f.type);
      await db.insert(visaDocuments).values({ applicationId: app.id, kind: f.kind, storageKey: key, fileName: f.file.name.slice(0, 200), contentType: f.type, sizeBytes: f.file.size });
    }
    await db.insert(notifications).values({ userId: user.id, title: `Visa application ${reference}`, body: "Received by NOOR.", link: `/account/visas` });
    const ops = opsEmail();
    if (ops) await sendEmail({ to: ops, subject: `New visa application ${reference}`, text: `${parsed.data.applicantName} – ${parsed.data.nationality} → ${parsed.data.destination} (${parsed.data.visaType}), ${files.length} document(s)` });
  } catch (err) {
    console.error("visa failed", err);
    return { error: "unavailable" };
  }
  redirect(`/${locale}/account/visas?new=${reference}`);
}
