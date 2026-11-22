import { desc, eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { requireDb } from "@/lib/db";
import { bookings, payments } from "@/lib/db/schema";
import { paymentsEnabled } from "@/lib/payments";
import { createRefundAction } from "@/app/actions/admin";
import { AdminShell, Table, aed, dt } from "@/components/admin/AdminShell";

export const metadata = { title: "Payments" };

export default async function AdminPayments({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requirePermission("payments");
  const sp = await searchParams;
  const db = await requireDb();
  const rows = await db.select({ p: payments, ref: bookings.reference }).from(payments).innerJoin(bookings, eq(bookings.id, payments.bookingId)).orderBy(desc(payments.createdAt)).limit(200);
  const refunds = can(user.role, "refunds");
  return (
    <AdminShell user={user} title="Payments">
      {!paymentsEnabled() && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-900">Online payment is not configured (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET). Bookings stay “requested”.</p>}
      {sp.error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-noor-red">Refund refused ({sp.error}).</p>}
      <Table
        head={["Booking", "Provider", "Amount", "Status", "Created", refunds ? "Refund" : ""]}
        rows={rows.map(({ p, ref }) => [
          ref,
          `${p.provider} ${p.providerPaymentId ?? ""}`,
          aed(p.amountMinor),
          p.status,
          dt(p.createdAt),
          refunds && (p.status === "paid" || p.status === "partially_refunded") ? (
            <form key="r" action={createRefundAction} className="flex gap-1">
              <input type="hidden" name="paymentId" value={p.id} />
              <input name="amount" className="field w-24 py-1" defaultValue={(p.amountMinor / 100).toFixed(2)} aria-label="Amount" />
              <input name="reason" className="field w-32 py-1" placeholder="Reason" aria-label="Reason" />
              <button className="btn btn-outline px-2 py-1 text-xs">Refund</button>
            </form>
          ) : (
            ""
          ),
        ])}
      />
    </AdminShell>
  );
}
