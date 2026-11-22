import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { hotelAreas } from "@/lib/catalog";
import { todayInDubai } from "@/lib/format";
import { PageHero } from "@/components/ui/PageHero";
import { SearchPanel } from "@/components/search/SearchPanel";
import { Section } from "@/components/ui/Section";
import { carCategories } from "@/lib/catalog";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { SupplierPortal } from "@/components/catalog/SupplierPortal";

type P = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const dict = getDictionary(await resolveLocale(params));
  return { title: dict.nav.cars };
}

export default async function Landing({ params, searchParams }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const sp = await searchParams;
  return (
    <>
      <PageHero photo="cars" title={dict.nav.cars} subtitle={dict.sections.carsSub}>
        <SearchPanel locale={locale} labels={dict.search} today={todayInDubai()} initialTab="cars" areaSuggestions={hotelAreas.map((a) => a.name[locale])} initial={{ destination: sp.area, query: sp.q }} />
      </PageHero>
      <Section id="categories" title={dict.sections.cars} subtitle={dict.supplier.carsNotConnected}>
        <CatalogGrid items={carCategories} locale={locale} dict={dict} cols="lg:grid-cols-3 xl:grid-cols-3" />
      </Section>
      <Section title={dict.extra.supplierPortalTitle} tone="grey">
        <SupplierPortal locale={locale} dict={dict} />
      </Section>
    </>
  );
}
