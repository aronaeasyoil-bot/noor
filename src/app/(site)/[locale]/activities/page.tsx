import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { activities, safaris } from "@/lib/catalog";
import { todayInDubai } from "@/lib/format";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { SearchPanel } from "@/components/search/SearchPanel";

type P = { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = getDictionary(await resolveLocale(params));
  return { title: d.nav.activities, description: d.sections.activitiesSub };
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export default async function ActivitiesPage({ params, searchParams }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);
  const all = [...activities, ...safaris];
  const terms = norm(q).split(/\s+/).filter(Boolean);
  const results = terms.length
    ? all.filter((i) => {
        const hay = norm(`${i.title.en} ${i.title.fr} ${i.title.ar} ${i.summary[locale]} ${i.slug}`);
        return terms.every((t) => hay.includes(t));
      })
    : activities;
  return (
    <>
      <PageHero photo="activities" title={dict.sections.activities} subtitle={dict.sections.activitiesSub}>
        <SearchPanel locale={locale} labels={dict.search} today={todayInDubai()} initialTab="activities" initial={{ query: q }} />
      </PageHero>
      <Section title={q ? dict.extra.resultsFor.replace("{q}", q) : dict.nav.activities}>
        {results.length ? (
          <CatalogGrid items={results} locale={locale} dict={dict} />
        ) : (
          <p className="card p-5" data-testid="no-activity">
            {dict.extra.noActivity} <Link href={`/${locale}/quote?service=activities`} className="font-bold text-noor-blue underline">{dict.sections.requestQuote}</Link>
          </p>
        )}
      </Section>
    </>
  );
}
