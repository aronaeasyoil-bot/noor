import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { services } from "@/lib/catalog";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: getDictionary(await resolveLocale(params)).extra.servicesTitle };
}

export default async function ServicesPage({ params }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  return (
    <>
      <PageHero photo="concierge" title={dict.extra.servicesTitle} subtitle={dict.extra.servicesSub} />
      <Section title={dict.nav.more}>
        <CatalogGrid items={services} locale={locale} dict={dict} withPrice={false} />
      </Section>
    </>
  );
}
