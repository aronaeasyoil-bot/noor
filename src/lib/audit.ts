import "server-only";
import type { Database } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";

export async function audit(db: Database, actorId: string | null, action: string, entity: string, entityId: string | null, data?: unknown) {
  try {
    await db.insert(auditLog).values({ actorId, action, entity, entityId, data: (data ?? null) as never });
  } catch (err) {
    console.error("audit failed", err);
  }
}
