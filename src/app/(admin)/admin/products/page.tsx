import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { requireDb } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { allCatalogItems } from "@/lib/catalog";
import { saveProductAction } from "@/app/actions/admin";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = { title: "Catalogue & prices" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requirePermission("products");
  const sp = await searchParams;
  const db = await requireDb();
  const rows = new Map((await db.select().from(products)).map((p) => [p.slug, p]));
  const pricing = can(user.role, "productsPricing");
  const items = allCatalogItems.filter((i) => i.category !== "service");
  return (
    <AdminShell user={user} title="Catalogue & prices">
      <p className="mb-4 max-w-3xl text-sm text-noor-muted">
        Texts and photos are managed in the catalogue code. Here NOOR sets the real commercial terms. An item with no price is shown as “price on request” and can only be requested, not paid online. Prices are in AED, taxes included.
      </p>
      {sp.saved && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Saved: {sp.saved}</p>}
      {sp.error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-noor-red">Please check the values ({sp.error}).</p>}
      <ul className="space-y-3">
        {items.map((i) => {
          const p = rows.get(i.slug);
          return (
            <li key={i.slug} id={i.slug} className="card scroll-mt-4 p-4">
              <form action={saveProductAction} className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[1.5fr_repeat(6,1fr)_auto]">
                <input type="hidden" name="slug" value={i.slug} />
                <div>
                  <p className="font-extrabold">{i.title.en}</p>
                  <p className="text-xs text-noor-muted">{i.category} · {i.slug}</p>
                </div>
                <label className="text-xs font-bold">Status<select name="status" defaultValue={p?.status ?? "active"} className="field mt-1" disabled={!pricing}>{["draft", "active", "inactive"].map((s) => <option key={s}>{s}</option>)}</select></label>
                <label className="text-xs font-bold">Price (AED)<input name="price" inputMode="decimal" defaultValue={p?.priceMinor ? (p.priceMinor / 100).toFixed(2) : ""} placeholder="on request" className="field mt-1" disabled={!pricing} /></label>
                <label className="text-xs font-bold">Unit<select name="priceUnit" defaultValue={p?.priceUnit ?? i.priceUnit ?? "per_person"} className="field mt-1" disabled={!pricing}>{["per_person", "per_vehicle", "per_group", "per_day"].map((s) => <option key={s}>{s}</option>)}</select></label>
                <label className="text-xs font-bold">Min pax<input name="minPax" type="number" min={1} defaultValue={p?.minPax ?? 1} className="field mt-1" disabled={!pricing} /></label>
                <label className="text-xs font-bold">Max pax<input name="maxPax" type="number" min={1} defaultValue={p?.maxPax ?? i.maxPax ?? 20} className="field mt-1" disabled={!pricing} /></label>
                <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" name="requiresSlot" defaultChecked={p?.requiresSlot ?? i.requiresSlot ?? false} disabled={!pricing} /> Time slots</label>
                {pricing && <button className="btn btn-navy">Save</button>}
                <label className="text-xs font-bold sm:col-span-2 xl:col-span-8">Cancellation policy<textarea name="cancellationPolicy" defaultValue={p?.cancellationPolicy ?? ""} className="field mt-1 min-h-12" disabled={!pricing} /></label>
              </form>
            </li>
          );
        })}
      </ul>
    </AdminShell>
  );
}
