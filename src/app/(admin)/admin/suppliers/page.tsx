import { desc } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/session";
import { requireDb } from "@/lib/db";
import { suppliers } from "@/lib/db/schema";
import { integrationStatus } from "@/lib/suppliers";
import { saveSupplierAction } from "@/app/actions/admin";
import { AdminShell, Table } from "@/components/admin/AdminShell";

export const metadata = { title: "Suppliers & integrations" };

export default async function AdminSuppliers() {
  const user = await requirePermission("suppliers");
  const db = await requireDb();
  const rows = await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
  return (
    <AdminShell user={user} title="Suppliers & integrations">
      <h2 className="mb-3 text-lg font-extrabold">Integration status</h2>
      <Table
        head={["Integration", "Status", "Server variables"]}
        rows={integrationStatus().map((i) => [
          i.key,
          <span key="s" className={`chip ${i.configured ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{i.configured ? "configured" : "not configured"}</span>,
          <code key="e" className="text-xs">{i.env.join(", ")}</code>,
        ])}
      />
      <p className="mt-2 text-xs text-noor-muted">Secret values are never displayed. They are set as Cloudflare Worker secrets.</p>
      <h2 className="mt-8 mb-3 text-lg font-extrabold">Supplier accounts</h2>
      <Table head={["Name", "Type", "Contact", "Integration", "Active"]} rows={rows.map((s) => [s.name, s.kind, `${s.contactEmail ?? ""} ${s.contactPhone ?? ""}`, s.integration, s.active ? "yes" : "no"])} />
      <form action={saveSupplierAction} className="card mt-4 grid gap-3 p-4 sm:grid-cols-3">
        <input name="name" className="field" placeholder="Supplier name" required aria-label="Name" />
        <select name="kind" className="field" aria-label="Type">{["flights", "hotels", "cars", "transfers", "activities", "visa", "other"].map((k) => <option key={k}>{k}</option>)}</select>
        <input name="contactEmail" type="email" className="field" placeholder="Email" aria-label="Email" />
        <input name="contactPhone" className="field" placeholder="Phone" aria-label="Phone" />
        <input name="notes" className="field sm:col-span-2" placeholder="Notes (contract, commission…)" aria-label="Notes" />
        <button className="btn btn-navy sm:col-span-3 sm:justify-self-start">Add supplier</button>
      </form>
    </AdminShell>
  );
}
