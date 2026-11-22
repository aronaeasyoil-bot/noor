import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { quoteRequests } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { AccountShell } from "@/components/account/AccountShell";
import { StatusBadge } from "@/components/account/StatusBadge";

type P = { params: Promise<{ locale: string }> };
export const metadata: Metadata = { robots: { index: false } };

export default async function QuotesPage({ params }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const user = await requireUser(locale, `/${locale}/account/quotes`);
  const db = await getDb();
  const rows = db ? await db.select().from(quoteRequests).where(eq(quoteRequests.userId, user.id)).orderBy(desc(quoteRequests.createdAt)).limit(100) : [];
  return (
    <AccountShell locale={locale} dict={dict} active="/quotes" title={dict.account.quotes}>
      {rows.length === 0 ? (
        <p className="card p-6 text-noor-muted">{dict.account.noBookings}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((q) => (
            <li key={q.id} className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-extrabold">{q.service}</p>
                <p className="text-sm text-noor-muted">{q.reference} · {formatDate(q.createdAt, locale)}</p>
              </div>
              <StatusBadge status={q.status} label={q.status} />
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
