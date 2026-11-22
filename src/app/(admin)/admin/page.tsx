import Link from "next/link";
import { count, eq, gte, sql, and } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/session";
import { requireDb } from "@/lib/db";
import { bookings, payments, quoteRequests, users, visaApplications } from "@/lib/db/schema";
import { AdminShell, aed } from "@/components/admin/AdminShell";

export const metadata = { title: "Dashboard" };

/** Every figure below is computed from the database. Nothing is sample data. */
export default async function Dashboard() {
  const user = await requirePermission("dashboard");
  const db = await requireDb();
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [[b30], [open], [q], [v], [c], [rev]] = await Promise.all([
    db.select({ n: count() }).from(bookings).where(gte(bookings.createdAt, since)),
    db.select({ n: count() }).from(bookings).where(sql`${bookings.status} in ('requested','pending_payment','cancellation_requested')`),
    db.select({ n: count() }).from(quoteRequests).where(eq(quoteRequests.status, "new")),
    db.select({ n: count() }).from(visaApplications).where(sql`${visaApplications.status} in ('submitted','documents_required','in_review')`),
    db.select({ n: count() }).from(users).where(eq(users.role, "customer")),
    db.select({ total: sql<number>`coalesce(sum(${payments.amountMinor}),0)::int` }).from(payments).where(and(eq(payments.status, "paid"), gte(payments.createdAt, since))),
  ]);
  const cards = [
    { label: "Bookings (30 days)", value: b30?.n ?? 0, href: "/admin/bookings" },
    { label: "Bookings to handle", value: open?.n ?? 0, href: "/admin/bookings?status=open" },
    { label: "New quote requests", value: q?.n ?? 0, href: "/admin/quotes" },
    { label: "Visa files in progress", value: v?.n ?? 0, href: "/admin/visas" },
    { label: "Customers", value: c?.n ?? 0, href: "/admin/customers" },
    { label: "Paid online (30 days)", value: aed(rev?.total ?? 0), href: "/admin/payments" },
  ];
  return (
    <AdminShell user={user} title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((k) => (
          <Link key={k.label} href={k.href} className="card p-5 hover:border-noor-red">
            <p className="text-sm text-noor-muted">{k.label}</p>
            <p className="mt-1 text-3xl font-extrabold" data-testid="kpi">{k.value}</p>
          </Link>
        ))}
      </div>
      <p className="mt-4 text-xs text-noor-muted">Figures are computed live from the NOOR database.</p>
    </AdminShell>
  );
}
