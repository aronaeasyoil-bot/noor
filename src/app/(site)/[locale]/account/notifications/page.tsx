import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { markNotificationsReadAction } from "@/app/actions/account";
import { AccountShell } from "@/components/account/AccountShell";

type P = { params: Promise<{ locale: string }> };
export const metadata: Metadata = { robots: { index: false } };

export default async function NotificationsPage({ params }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const user = await requireUser(locale, `/${locale}/account/notifications`);
  const db = await getDb();
  const rows = db ? await db.select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)).limit(100) : [];
  return (
    <AccountShell locale={locale} dict={dict} active="/notifications" title={dict.account.notifications}>
      {rows.length === 0 ? (
        <p className="card p-6 text-noor-muted">{dict.account.noNotifications}</p>
      ) : (
        <>
          <form action={markNotificationsReadAction} className="mb-3">
            <input type="hidden" name="locale" value={locale} />
            <button className="text-sm font-bold text-noor-blue hover:underline">✓</button>
          </form>
          <ul className="space-y-2">
            {rows.map((n) => (
              <li key={n.id} className={`card p-4 ${n.readAt ? "" : "border-s-4 border-noor-red"}`}>
                {n.link ? <Link href={`/${locale}${n.link}`} className="font-bold hover:underline">{n.title}</Link> : <p className="font-bold">{n.title}</p>}
                <p className="text-sm text-noor-muted">{n.body} · {formatDate(n.createdAt, locale)}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </AccountShell>
  );
}
