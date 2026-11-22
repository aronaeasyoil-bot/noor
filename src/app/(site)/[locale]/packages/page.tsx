import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { packages } from "@/lib/catalog";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = getDictionary(await resolveLocale(params));
  return { title: d.nav.packages };
}

export default async function PackagesPage({ params }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  return (
    <>
      <PageHero photo="packages" title={dict.sections.packages} subtitle={dict.sections.packagesSub} />
      <Section title={dict.nav.packages} subtitle={dict.quote.subtitle}>
        <CatalogGrid items={packages} locale={locale} dict={dict} withPrice={false} />
      </Section>
    </>
  );
}
