import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { visaApplications, visaDocuments } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { getPrivate } from "@/lib/storage";
import { audit } from "@/lib/audit";

/** Streams a visa document to its owner or to staff allowed to handle visas. Everyone else gets 404. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Not found", { status: 404 });
  const user = await getCurrentUser();
  const db = await getDb();
  if (!user || !db) return new Response("Not found", { status: 404 });
  const [row] = await db
    .select({ doc: visaDocuments, ownerId: visaApplications.userId })
    .from(visaDocuments)
    .innerJoin(visaApplications, eq(visaApplications.id, visaDocuments.applicationId))
    .where(eq(visaDocuments.id, id))
    .limit(1);
  const staff = can(user.role, "visas");
  if (!row || (row.ownerId !== user.id && !staff)) return new Response("Not found", { status: 404 });
  const data = await getPrivate(row.doc.storageKey);
  if (!data) return new Response("Not found", { status: 404 });
  if (staff && row.ownerId !== user.id) await audit(db, user.id, "visa.document.viewed", "visa_document", id, {});
  return new Response(data, {
    headers: {
      "content-type": row.doc.contentType,
      "content-disposition": `inline; filename="${row.doc.fileName.replace(/[^\w.\- ]/g, "_")}"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
