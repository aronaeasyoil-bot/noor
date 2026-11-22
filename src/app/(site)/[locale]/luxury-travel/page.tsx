import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { packages, services } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth/session";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { serviceOptions } from "@/components/catalog/serviceOptions";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: getDictionary(await resolveLocale(params)).extra.luxuryTitle };
}

const slugs = ["luxury-holiday", "honeymoon", "yacht-rentals", "private-jets", "vip-services", "concierge"];

export default async function LuxuryPage({ params }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const user = await getCurrentUser();
  const items = [...packages, ...services].filter((i) => slugs.includes(i.slug));
  return (
    <>
      <PageHero photo="luxury" title={dict.extra.luxuryTitle} subtitle={dict.extra.luxurySub} />
      <Section title={dict.extra.luxuryTitle}>
        <CatalogGrid items={items} locale={locale} dict={dict} withPrice={false} />
      </Section>
      <Section title={dict.quote.title} subtitle={dict.quote.subtitle} tone="grey">
        <div className="card max-w-3xl p-5 sm:p-8">
          <QuoteForm locale={locale} q={dict.quote} c={dict.common} rateLimited={dict.auth.rateLimited} services={serviceOptions(locale, dict)} defaultService="luxury-holiday" whatsappPrefill={dict.whatsapp.prefill} user={user} />
        </div>
      </Section>
    </>
  );
}
