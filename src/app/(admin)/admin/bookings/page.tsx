import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/session";
import { requireDb } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { AdminShell, Table, aed, dt } from "@/components/admin/AdminShell";

export const metadata = { title: "Bookings" };

export default async function AdminBookings({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requirePermission("bookings");
  const db = await requireDb();
  const sp = await searchParams;
  const q = db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(200);
  const rows = sp.status === "open" ? await q.where(sql`${bookings.status} in ('requested','pending_payment','cancellation_requested')`) : await q;
  return (
    <AdminShell user={user} title="Bookings">
      <Table
        head={["Reference", "Product", "Customer", "Date", "Pax", "Amount", "Status", "Payment", "Created"]}
        rows={rows.map((b) => [
          <Link key="r" href={`/admin/bookings/${b.reference}`} className="font-bold text-noor-blue underline">{b.reference}</Link>,
          b.productTitle,
          <span key="c">{b.contactName}<br /><span className="text-xs text-noor-muted">{b.contactEmail}</span></span>,
          b.travelDate ?? "—",
          `${b.adults}+${b.children}`,
          aed(b.amountMinor),
          b.status,
          b.paymentStatus,
          dt(b.createdAt),
        ])}
      />
    </AdminShell>
  );
}
