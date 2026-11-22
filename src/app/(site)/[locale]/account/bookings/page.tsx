import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { bookingStatusLabelKey } from "@/lib/bookings";
import { formatDate, formatMoney } from "@/lib/format";
import { AccountShell } from "@/components/account/AccountShell";
import { StatusBadge } from "@/components/account/StatusBadge";

type P = { params: Promise<{ locale: string }> };
export const metadata: Metadata = { robots: { index: false } };

export default async function BookingsPage({ params }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const user = await requireUser(locale, `/${locale}/account/bookings`);
  const db = await getDb();
  const rows = db ? await db.select().from(bookings).where(eq(bookings.userId, user.id)).orderBy(desc(bookings.createdAt)).limit(100) : [];
  return (
    <AccountShell locale={locale} dict={dict} active="/bookings" title={dict.account.bookings}>
      {rows.length === 0 ? (
        <p className="card p-6 text-noor-muted" data-testid="no-bookings">{dict.account.noBookings}</p>
      ) : (
        <ul className="space-y-3" data-testid="booking-list">
          {rows.map((b) => (
            <li key={b.id}>
              <Link href={`/${locale}/account/bookings/${b.reference}`} className="card flex flex-col gap-2 p-4 hover:border-noor-red sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-extrabold">{(b.details as { titleLocalized?: string }).titleLocalized ?? b.productTitle}</p>
                  <p className="text-sm text-noor-muted">{b.reference} · {b.travelDate ? formatDate(b.travelDate, locale) : "—"}</p>
                </div>
                <div className="flex items-center gap-3">
                  {b.amountMinor ? <span className="font-bold">{formatMoney(b.amountMinor, b.currency, locale)}</span> : null}
                  <StatusBadge status={b.status} label={dict.booking[bookingStatusLabelKey[b.status]]} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
