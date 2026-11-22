import { desc } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/session";
import { requireDb } from "@/lib/db";
import { refunds } from "@/lib/db/schema";
import { AdminShell, Table, aed, dt } from "@/components/admin/AdminShell";

export const metadata = { title: "Refunds" };

export default async function AdminRefunds() {
  const user = await requirePermission("refunds");
  const db = await requireDb();
  const rows = await db.select().from(refunds).orderBy(desc(refunds.createdAt)).limit(200);
  return (
    <AdminShell user={user} title="Refunds">
      <Table head={["Payment", "Amount", "Status", "Provider ref", "Reason", "Created"]} rows={rows.map((r) => [r.paymentId.slice(0, 8), aed(r.amountMinor), r.status, r.providerRef ?? "—", r.reason ?? "", dt(r.createdAt)])} />
    </AdminShell>
  );
}
