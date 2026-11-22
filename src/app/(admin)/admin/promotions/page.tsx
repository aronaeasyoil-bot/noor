import { desc } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/session";
import { requireDb } from "@/lib/db";
import { promotions } from "@/lib/db/schema";
import { savePromotionAction } from "@/app/actions/admin";
import { AdminShell, Table, dt } from "@/components/admin/AdminShell";

export const metadata = { title: "Promotions" };

export default async function AdminPromotions() {
  const user = await requirePermission("promotions");
  const db = await requireDb();
  const rows = await db.select().from(promotions).orderBy(desc(promotions.createdAt));
  return (
    <AdminShell user={user} title="Promotions">
      <p className="mb-4 text-sm text-noor-muted">Active promotions appear in “Exclusive Travel Deals” on the home page. Write the real conditions in the description.</p>
      <Table head={["Code", "Description", "% off", "Valid to", "Active"]} rows={rows.map((p) => [p.code, p.description, p.percentOff ?? "—", dt(p.validTo), p.active ? "yes" : "no"])} />
      <form action={savePromotionAction} className="card mt-4 grid gap-3 p-4 sm:grid-cols-4">
        <input name="code" className="field" placeholder="CODE" required aria-label="Code" />
        <input name="description" className="field sm:col-span-3" placeholder="Offer and conditions" required aria-label="Description" />
        <input name="percentOff" type="number" min={0} max={90} className="field" placeholder="% off" aria-label="Percent off" />
        <input name="validTo" type="date" className="field" aria-label="Valid to" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Active</label>
        <button className="btn btn-navy">Save</button>
      </form>
    </AdminShell>
  );
}
