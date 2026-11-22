import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Liveness + database reachability. Never returns connection details. */
export async function GET() {
  const db = await getDb().catch(() => null);
  if (!db) return Response.json({ ok: true, db: "not_configured" });
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, db: "ok" });
  } catch (err) {
    const e = err as { code?: string; name?: string; message?: string };
    const message = String(e.message ?? "").replace(/postgres(ql)?:\/\/\S+/gi, "[url]").slice(0, 160);
    return Response.json({ ok: false, db: "error", code: e.code ?? null, name: e.name ?? null, message }, { status: 503 });
  }
}
