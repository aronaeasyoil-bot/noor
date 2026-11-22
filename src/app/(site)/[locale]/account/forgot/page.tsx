import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthCard } from "@/components/account/AuthCard";
import { ForgotForm } from "@/components/forms/AuthForms";

type P = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };
export const metadata: Metadata = { robots: { index: false } };

export default async function Page({ params, searchParams }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const sp = await searchParams;
  const next = sp.next && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : undefined;
  if (await getCurrentUser()) redirect(next ?? `/${locale}/account`);
  return (
    <AuthCard title={dict.auth.resetTitle}>
      <ForgotForm locale={locale} a={dict.auth} c={dict.common}  />
    </AuthCard>
  );
}
