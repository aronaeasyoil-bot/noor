import { sql } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/session";
import { requireDb } from "@/lib/db";
import { bookings, quoteRequests } from "@/lib/db/schema";
import { AdminShell, Table, aed } from "@/components/admin/AdminShell";

export const metadata = { title: "Reports" };

export default async function AdminReports() {
  const user = await requirePermission("reports");
  const db = await requireDb();
  const [byMonth, byProduct, byService] = await Promise.all([
    db.select({ month: sql<string>`to_char(${bookings.createdAt} at time zone 'Asia/Dubai', 'YYYY-MM')`, n: sql<number>`count(*)::int`, paid: sql<number>`coalesce(sum(case when ${bookings.paymentStatus} = 'paid' then ${bookings.amountMinor} end),0)::int` }).from(bookings).groupBy(sql`1`).orderBy(sql`1 desc`).limit(12),
    db.select({ product: bookings.productTitle, n: sql<number>`count(*)::int` }).from(bookings).groupBy(bookings.productTitle).orderBy(sql`2 desc`).limit(15),
    db.select({ service: quoteRequests.service, n: sql<number>`count(*)::int` }).from(quoteRequests).groupBy(quoteRequests.service).orderBy(sql`2 desc`).limit(15),
  ]);
  return (
    <AdminShell user={user} title="Reports">
      <h2 className="mb-2 font-extrabold">Bookings by month</h2>
      <Table head={["Month", "Bookings", "Paid online"]} rows={byMonth.map((r) => [r.month, r.n, aed(r.paid)])} />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div><h2 className="mb-2 font-extrabold">Top products</h2><Table head={["Product", "Bookings"]} rows={byProduct.map((r) => [r.product, r.n])} /></div>
        <div><h2 className="mb-2 font-extrabold">Quote requests by service</h2><Table head={["Service", "Requests"]} rows={byService.map((r) => [r.service, r.n])} /></div>
      </div>
    </AdminShell>
  );
}
