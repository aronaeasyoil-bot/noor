import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { requireDb } from "@/lib/db";
import { bookings, payments } from "@/lib/db/schema";
import { updateBookingAction } from "@/app/actions/admin";
import { AdminShell, Table, aed, dt } from "@/components/admin/AdminShell";

export default async function AdminBooking({ params, searchParams }: { params: Promise<{ ref: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requirePermission("bookings");
  const { ref } = await params;
  const sp = await searchParams;
  const db = await requireDb();
  const [b] = await db.select().from(bookings).where(eq(bookings.reference, ref)).limit(1);
  if (!b) notFound();
  const pays = await db.select().from(payments).where(eq(payments.bookingId, b.id)).orderBy(desc(payments.createdAt));
  const write = can(user.role, "bookingsWrite");
  return (
    <AdminShell user={user} title={`Booking ${b.reference}`}>
      {sp.saved && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Saved. The customer was notified.</p>}
      {sp.error === "unpaid" && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-noor-red">This booking has an amount and is not paid. Tick “confirm without online payment” only if payment was received another way.</p>}
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="card space-y-2 p-5 text-sm">
          <p><b>Product:</b> {b.productTitle} ({b.productType})</p>
          <p><b>Date:</b> {b.travelDate ?? "—"} · <b>Pax:</b> {b.adults} adults, {b.children} children</p>
          <p><b>Contact:</b> {b.contactName} · {b.contactEmail} · {b.contactPhone}</p>
          <p><b>Status:</b> {b.status} · <b>Payment:</b> {b.paymentStatus} · <b>Amount:</b> {aed(b.amountMinor)}</p>
          <pre className="overflow-x-auto rounded bg-noor-bg p-3 text-xs">{JSON.stringify(b.details, null, 2)}</pre>
        </div>
        {write && (
          <form action={updateBookingAction} className="card grid gap-3 p-5">
            <input type="hidden" name="id" value={b.id} />
            <label className="field-label" htmlFor="st">Status</label>
            <select id="st" name="status" className="field" defaultValue={b.status}>
              {["requested", "pending_payment", "confirmed", "cancellation_requested", "cancelled", "refunded", "failed"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <label className="field-label" htmlFor="am">Confirmed amount (AED)</label>
            <input id="am" name="amount" className="field" inputMode="decimal" defaultValue={b.amountMinor ? (b.amountMinor / 100).toFixed(2) : ""} />
            <p className="text-xs text-noor-muted">Set status to “pending_payment” with an amount to let the customer pay online. “Paid” is set only by the payment provider.</p>
            <label className="field-label" htmlFor="sr">Supplier reference</label>
            <input id="sr" name="supplierReference" className="field" defaultValue={b.supplierReference ?? ""} />
            <label className="field-label" htmlFor="nt">Internal notes</label>
            <textarea id="nt" name="internalNotes" className="field" defaultValue={b.internalNotes ?? ""} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="confirmUnpaid" /> Confirm without online payment</label>
            <button className="btn btn-primary">Save</button>
          </form>
        )}
      </div>
      <h2 className="mt-6 mb-3 text-lg font-extrabold">Payments</h2>
      <Table head={["Provider", "Ref", "Amount", "Status", "Created"]} rows={pays.map((p) => [p.provider, p.providerRef ?? "—", aed(p.amountMinor), p.status, dt(p.createdAt)])} />
    </AdminShell>
  );
}
