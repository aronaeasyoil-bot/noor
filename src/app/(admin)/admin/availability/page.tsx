import { and, asc, eq, gte } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/session";
import { requireDb } from "@/lib/db";
import { availabilitySlots, products } from "@/lib/db/schema";
import { addSlotsAction, removeSlotAction } from "@/app/actions/admin";
import { todayInDubai } from "@/lib/format";
import { AdminShell, Table } from "@/components/admin/AdminShell";

export const metadata = { title: "Availability" };

export default async function AdminAvailability({ searchParams }: { searchParams: Promise<{ slug?: string; added?: string; error?: string }> }) {
  const user = await requirePermission("products");
  const sp = await searchParams;
  const db = await requireDb();
  const prods = await db.select({ slug: products.slug, requiresSlot: products.requiresSlot }).from(products).orderBy(asc(products.slug));
  const slug = sp.slug ?? prods.find((p) => p.requiresSlot)?.slug ?? prods[0]?.slug;
  const today = todayInDubai();
  const slots = slug ? await db.select().from(availabilitySlots).where(and(eq(availabilitySlots.productSlug, slug), gte(availabilitySlots.date, today))).orderBy(asc(availabilitySlots.date), asc(availabilitySlots.startTime)).limit(300) : [];
  return (
    <AdminShell user={user} title="Availability calendar">
      {prods.length === 0 && <p className="card mb-4 p-4 text-sm">Save a product in “Catalogue & prices” first.</p>}
      {sp.added && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{sp.added} slot(s) created (existing ones were kept).</p>}
      {sp.error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-noor-red">Please check the values.</p>}
      <form className="mb-4 flex flex-wrap gap-2" method="get">
        <select name="slug" defaultValue={slug} className="field w-auto" aria-label="Product">{prods.map((p) => <option key={p.slug}>{p.slug}</option>)}</select>
        <button className="btn btn-outline">Show</button>
      </form>
      {slug && (
        <form action={addSlotsAction} className="card mb-5 grid items-end gap-3 p-4 sm:grid-cols-5">
          <input type="hidden" name="slug" value={slug} />
          <label className="text-xs font-bold">From<input type="date" name="from" min={today} defaultValue={today} className="field mt-1" required /></label>
          <label className="text-xs font-bold">To<input type="date" name="to" min={today} defaultValue={today} className="field mt-1" required /></label>
          <label className="text-xs font-bold">Times (comma separated)<input name="times" defaultValue="15:00" className="field mt-1" required /></label>
          <label className="text-xs font-bold">Seats per slot<input type="number" name="capacity" min={1} defaultValue={20} className="field mt-1" required /></label>
          <button className="btn btn-navy">Open dates</button>
        </form>
      )}
      <Table
        head={["Date", "Time", "Capacity", "Booked", "Remaining", ""]}
        rows={slots.map((s) => [
          s.date,
          s.startTime,
          s.capacity,
          s.booked,
          s.capacity - s.booked,
          s.booked === 0 ? (
            <form key="d" action={removeSlotAction}><input type="hidden" name="id" value={s.id} /><button className="text-xs font-bold text-noor-red">Remove</button></form>
          ) : (
            ""
          ),
        ])}
        empty="No open dates. Customers can still send a request."
      />
    </AdminShell>
  );
}
