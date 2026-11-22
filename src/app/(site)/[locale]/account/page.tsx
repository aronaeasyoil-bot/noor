import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth/session";
import { AccountShell } from "@/components/account/AccountShell";
import { ProfileForm } from "@/components/forms/AuthForms";

type P = { params: Promise<{ locale: string }> };
export const metadata: Metadata = { robots: { index: false } };

export default async function AccountPage({ params }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const user = await requireUser(locale, `/${locale}/account`);
  return (
    <AccountShell locale={locale} dict={dict} active="" title={dict.account.profile}>
      <div className="card p-5 sm:p-7">
        <ProfileForm locale={locale} user={user} labels={{ updated: dict.account.updated, currency: dict.nav.currency }} c={dict.common} a={dict.auth} />
      </div>
    </AccountShell>
  );
}
