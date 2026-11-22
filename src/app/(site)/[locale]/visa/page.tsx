import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth/session";
import { PageHero } from "@/components/ui/PageHero";
import { Icon } from "@/components/icons";
import { VisaForm } from "@/components/forms/VisaForm";
import { Photo } from "@/components/ui/Photo";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = getDictionary(await resolveLocale(params));
  return { title: d.visa.title, description: d.visa.subtitle };
}

export default async function VisaPage({ params }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const v = dict.visa;
  const user = await getCurrentUser();
  return (
    <>
      <PageHero photo="visa" title={v.title} subtitle={v.subtitle} />
      <div className="container-noor grid gap-8 py-10 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-6">
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950" data-testid="visa-disclaimer">
            <Icon name="shield" size={22} className="mt-0.5 shrink-0" />
            <p className="text-sm font-semibold">{v.disclaimer}</p>
          </div>
          <section>
            <h2 className="text-xl font-extrabold">{v.requiredDocs}</h2>
            <ul className="mt-3 space-y-2">
              {v.docs.map((d) => (
                <li key={d} className="flex gap-2"><Icon name="check" size={18} className="mt-0.5 shrink-0 text-emerald-600" />{d}</li>
              ))}
            </ul>
          </section>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl"><Photo name="visaDocs" sizes="(max-width: 1024px) 100vw, 40vw" /></div>
        </div>
        <section className="card p-5 sm:p-7">
          <h2 className="mb-4 text-xl font-extrabold">{v.applyTitle}</h2>
          {user ? (
            <>
              <VisaForm locale={locale} v={v} c={dict.common} name={user.name} rateLimited={dict.auth.rateLimited} />
              <Link href={`/${locale}/account/visas`} className="mt-4 inline-block text-sm font-bold text-noor-blue underline">{v.track}</Link>
            </>
          ) : (
            <div>
              <p className="text-noor-muted">{v.signInRequired}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link className="btn btn-primary" href={`/${locale}/account/sign-in?next=/${locale}/visa`}>{dict.auth.signIn}</Link>
                <Link className="btn btn-outline" href={`/${locale}/account/register?next=/${locale}/visa`}>{dict.auth.register}</Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
