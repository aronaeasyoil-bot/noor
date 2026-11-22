import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { travellers } from "@/lib/db/schema";
import { addTravellerAction, removeTravellerAction } from "@/app/actions/account";
import { AccountShell } from "@/components/account/AccountShell";

type P = { params: Promise<{ locale: string }> };
export const metadata: Metadata = { robots: { index: false } };

export default async function TravellersPage({ params }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const a = dict.account;
  const user = await requireUser(locale, `/${locale}/account/travellers`);
  const db = await getDb();
  const rows = db ? await db.select().from(travellers).where(eq(travellers.userId, user.id)) : [];
  return (
    <AccountShell locale={locale} dict={dict} active="/travellers" title={a.travellers}>
      <ul className="mb-6 space-y-2" data-testid="traveller-list">
        {rows.map((t) => (
          <li key={t.id} className="card flex items-center justify-between p-4">
            <span className="font-bold">{t.firstName} {t.lastName} <span className="text-sm font-normal text-noor-muted">{t.nationality ?? ""} {t.dateOfBirth ?? ""}</span></span>
            <form action={removeTravellerAction}>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="id" value={t.id} />
              <button className="text-sm font-bold text-noor-red hover:underline">{dict.common.cancel}</button>
            </form>
          </li>
        ))}
      </ul>
      <form action={addTravellerAction} className="card grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="font-extrabold sm:col-span-2">{a.addTraveller}</h2>
        <input type="hidden" name="locale" value={locale} />
        <div><label className="field-label" htmlFor="t-fn">{a.firstName}</label><input id="t-fn" name="firstName" className="field" required /></div>
        <div><label className="field-label" htmlFor="t-ln">{a.lastName}</label><input id="t-ln" name="lastName" className="field" required /></div>
        <div><label className="field-label" htmlFor="t-dob">{a.dob}</label><input id="t-dob" name="dateOfBirth" type="date" className="field" /></div>
        <div><label className="field-label" htmlFor="t-nat">{a.nationality}</label><input id="t-nat" name="nationality" className="field" /></div>
        <button className="btn btn-primary sm:col-span-2 sm:justify-self-start">{dict.common.save}</button>
      </form>
    </AccountShell>
  );
}
