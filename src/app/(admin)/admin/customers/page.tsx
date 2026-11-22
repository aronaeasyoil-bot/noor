import { desc } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { requireDb } from "@/lib/db";
import { suppliers, users } from "@/lib/db/schema";
import { setUserRoleAction } from "@/app/actions/admin";
import { AdminShell, Table, dt } from "@/components/admin/AdminShell";

export const metadata = { title: "Customers & users" };

export default async function AdminCustomers() {
  const user = await requirePermission("customers");
  const db = await requireDb();
  const [rows, sups] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, role: users.role, disabled: users.disabled, supplierId: users.supplierId, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt)).limit(300),
    db.select({ id: suppliers.id, name: suppliers.name }).from(suppliers),
  ]);
  const manage = can(user.role, "users");
  return (
    <AdminShell user={user} title="Customers & users">
      <Table
        head={["Name", "Email", "Phone", "Created", manage ? "Role / access" : "Role"]}
        rows={rows.map((u) => [
          u.name,
          u.email,
          u.phone ?? "—",
          dt(u.createdAt),
          manage && u.id !== user.id ? (
            <form key="f" action={setUserRoleAction} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={u.id} />
              <select name="role" defaultValue={u.role} className="field w-auto py-1" aria-label="Role">
                {["customer", "super_admin", "admin", "booking_agent", "support_agent", "finance", "supplier"].map((r) => <option key={r}>{r}</option>)}
              </select>
              <select name="supplierId" defaultValue={u.supplierId ?? ""} className="field w-auto py-1" aria-label="Supplier">
                <option value="">—</option>
                {sups.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <label className="text-xs"><input type="checkbox" name="disabled" defaultChecked={u.disabled} /> disabled</label>
              <button className="btn btn-navy px-3 py-1 text-xs">Save</button>
            </form>
          ) : (
            u.role
          ),
        ])}
      />
    </AdminShell>
  );
}
