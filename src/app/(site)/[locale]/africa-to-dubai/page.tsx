import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { africaCities } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth/session";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Photo } from "@/components/ui/Photo";
import { Icon, type IconName } from "@/components/icons";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { serviceOptions } from "@/components/catalog/serviceOptions";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = getDictionary(await resolveLocale(params));
  return { title: d.nav.africa, description: d.africa.subtitle };
}

export default async function AfricaPage({ params }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const user = await getCurrentUser();
  const services: { href: string; label: string; icon: IconName }[] = [
    { href: "/flights?to=DXB", label: dict.nav.flights, icon: "plane" },
    { href: "/visa", label: dict.nav.visa, icon: "passport" },
    { href: "/hotels", label: dict.nav.hotels, icon: "bed" },
    { href: "/transfers", label: dict.nav.transfers, icon: "transfer" },
    { href: "/desert-safari", label: dict.nav.safari, icon: "dunes" },
    { href: "/packages", label: dict.nav.packages, icon: "suitcase" },
  ];
  return (
    <>
      <PageHero photo="africaHero" title={dict.africa.title} subtitle={dict.africa.subtitle} />
      <Section title={dict.africa.departures}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {africaCities.map((c) => (
            <article key={c.slug} id={c.slug} className="card scroll-mt-28 overflow-hidden" data-testid={`city-${c.slug}`}>
              <div className="relative aspect-[16/10]"><Photo name={c.photo} sizes="(max-width: 640px) 100vw, 33vw" /></div>
              <div className="p-4">
                <h3 className="text-lg font-extrabold">{c.name[locale]} <span className="text-sm font-semibold text-noor-muted">· {c.country[locale]}</span></h3>
                <p className="text-sm text-noor-muted">{c.iata} → DXB</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/${locale}/flights?from=${c.iata}&to=DXB`} className="btn btn-primary px-4 py-2 text-sm">{dict.africa.flightsFrom}</Link>
                  <Link href={`/${locale}/visa`} className="btn btn-outline px-4 py-2 text-sm">{dict.nav.visa}</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <Section title={dict.africa.services} tone="grey">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {services.map((s) => (
            <li key={s.href}>
              <Link href={`/${locale}${s.href}`} className="card flex flex-col items-center gap-2 p-4 text-center text-sm font-bold hover:border-noor-red">
                <Icon name={s.icon} size={26} className="text-noor-red" />
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <Section title={dict.africa.groups} subtitle={dict.africa.groupsBody}>
        <div className="card max-w-3xl p-5 sm:p-8">
          <QuoteForm locale={locale} q={dict.quote} c={dict.common} rateLimited={dict.auth.rateLimited} services={serviceOptions(locale, dict)} defaultService="group-travel" context={{ page: "africa-to-dubai" }} whatsappPrefill={dict.whatsapp.prefill} user={user} />
        </div>
      </Section>
    </>
  );
}
