import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { hotelAreas } from "@/lib/catalog";
import { todayInDubai } from "@/lib/format";
import { PageHero } from "@/components/ui/PageHero";
import { SearchPanel } from "@/components/search/SearchPanel";
import { Section } from "@/components/ui/Section";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { Photo } from "@/components/ui/Photo";

type P = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const dict = getDictionary(await resolveLocale(params));
  return { title: dict.nav.hotels };
}

export default async function Landing({ params, searchParams }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const sp = await searchParams;
  return (
    <>
      <PageHero photo="hotels" title={dict.nav.hotels} subtitle={dict.sections.hotelsSub}>
        <SearchPanel locale={locale} labels={dict.search} today={todayInDubai()} initialTab="hotels" areaSuggestions={hotelAreas.map((a) => a.name[locale])} initial={{ destination: sp.area, query: sp.q }} />
      </PageHero>
      <Section title={dict.sections.hotels} subtitle={dict.supplier.hotelsNotConnected}>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {hotelAreas.map((a) => (
            <PhotoCard key={a.slug} overlay href={`/${locale}/hotels?area=${encodeURIComponent(a.name[locale])}`} photo={a.photo} title={a.name[locale]} subtitle={a.blurb[locale]} />
          ))}
        </div>
      </Section>
      <Section title={dict.common.gallery} tone="grey">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(["hotelLobby", "roomBed", "hotelPool", "roomBath"] as const).map((p) => (
            <div key={p} className="relative aspect-[4/3] overflow-hidden rounded-2xl"><Photo name={p} sizes="(max-width: 1024px) 50vw, 25vw" /></div>
          ))}
        </div>
      </Section>
    </>
  );
}
