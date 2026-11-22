import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { hotelAreas } from "@/lib/catalog";
import { todayInDubai } from "@/lib/format";
import { PageHero } from "@/components/ui/PageHero";
import { SearchPanel } from "@/components/search/SearchPanel";
import { Section } from "@/components/ui/Section";
import { packages } from "@/lib/catalog";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";

type P = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const dict = getDictionary(await resolveLocale(params));
  return { title: dict.nav.flightHotel };
}

export default async function Landing({ params, searchParams }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const sp = await searchParams;
  return (
    <>
      <PageHero photo="flightHotel" title={dict.nav.flightHotel} subtitle={dict.sections.packagesSub}>
        <SearchPanel locale={locale} labels={dict.search} today={todayInDubai()} initialTab="flightHotel" areaSuggestions={hotelAreas.map((a) => a.name[locale])} initial={{ destination: sp.area, query: sp.q }} />
      </PageHero>
      <Section title={dict.sections.packages} subtitle={dict.sections.packagesSub}>
        <CatalogGrid items={packages} locale={locale} dict={dict} />
      </Section>
    </>
  );
}
