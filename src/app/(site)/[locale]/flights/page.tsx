import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { airportLabel, parseAirport } from "@/lib/airports";
import { hotelAreas, trendingRoutes } from "@/lib/catalog";
import { todayInDubai } from "@/lib/format";
import { PageHero } from "@/components/ui/PageHero";
import { SearchPanel } from "@/components/search/SearchPanel";
import { Section } from "@/components/ui/Section";
import { PhotoCard } from "@/components/ui/PhotoCard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return { title: getDictionary(await resolveLocale(params)).nav.flights };
}

export default async function FlightsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const sp = await searchParams;
  const from = parseAirport(sp.from);
  const to = parseAirport(sp.to);
  return (
    <>
      <PageHero photo="flights" title={dict.nav.flights} subtitle={dict.sections.trendingFlightsSub}>
        <SearchPanel
          locale={locale}
          labels={dict.search}
          today={todayInDubai()}
          initialTab="flights"
          areaSuggestions={hotelAreas.map((a) => a.name[locale])}
          initial={{ from: from ? airportLabel(from) : undefined, to: to ? airportLabel(to) : undefined }}
        />
      </PageHero>
      <Section title={dict.sections.trendingFlights} subtitle={dict.sections.trendingFlightsSub}>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {trendingRoutes.map((r) => (
            <PhotoCard key={`${r.from}-${r.to}`} href={`/${locale}/flights?from=${r.from}&to=${r.to}`} photo={r.photo} title={`${r.fromName[locale]} → ${r.toName[locale]}`} subtitle={`${r.from} – ${r.to}`} />
          ))}
        </div>
      </Section>
    </>
  );
}
