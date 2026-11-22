import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { visaApplications, visaDocuments } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { AccountShell } from "@/components/account/AccountShell";
import { StatusBadge } from "@/components/account/StatusBadge";

type P = { params: Promise<{ locale: string }>; searchParams: Promise<{ new?: string }> };
export const metadata: Metadata = { robots: { index: false } };

export default async function VisasPage({ params, searchParams }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const v = dict.visa;
  const user = await requireUser(locale, `/${locale}/account/visas`);
  const sp = await searchParams;
  const db = await getDb();
  const apps = db ? await db.select().from(visaApplications).where(eq(visaApplications.userId, user.id)).orderBy(desc(visaApplications.createdAt)) : [];
  const docs = db && apps.length ? await db.select().from(visaDocuments).where(inArray(visaDocuments.applicationId, apps.map((a) => a.id))) : [];
  return (
    <AccountShell locale={locale} dict={dict} active="/visas" title={dict.account.visas}>
      {sp.new && <p role="status" className="mb-4 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-900" data-testid="visa-created">{v.submitted} · {sp.new}</p>}
      <p className="mb-4 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-900">{v.disclaimer}</p>
      {apps.length === 0 ? (
        <p className="card p-6 text-noor-muted">
          — <Link href={`/${locale}/visa`} className="font-bold text-noor-blue underline">{v.applyTitle}</Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {apps.map((a) => (
            <li key={a.id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-extrabold">{a.applicantName} · {v.types[a.visaType as keyof typeof v.types] ?? a.visaType}</p>
                  <p className="text-sm text-noor-muted">{a.reference} · {formatDate(a.createdAt, locale)}</p>
                </div>
                <StatusBadge status={a.status} label={v.statuses[a.status]} />
              </div>
              {a.statusNote && <p className="mt-2 text-sm">{a.statusNote}</p>}
              <ul className="mt-3 flex flex-wrap gap-2">
                {docs.filter((d) => d.applicationId === a.id).map((d) => (
                  <li key={d.id}>
                    <a className="chip bg-noor-bg text-noor-blue underline" href={`/api/visa-documents/${d.id}`} target="_blank" rel="noopener noreferrer">
                      {v.docKinds[d.kind as keyof typeof v.docKinds] ?? d.kind}: {d.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
