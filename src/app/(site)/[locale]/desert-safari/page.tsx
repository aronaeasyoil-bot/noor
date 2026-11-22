import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { safaris } from "@/lib/catalog";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { CurrencyNote } from "@/components/ui/CurrencyNote";
import { Photo } from "@/components/ui/Photo";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = getDictionary(await resolveLocale(params));
  return { title: d.nav.safari, description: d.sections.safariSub };
}

export default async function SafariPage({ params }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  return (
    <>
      <PageHero photo="safari" title={dict.sections.safari} subtitle={dict.sections.safariSub} />
      <Section title={dict.nav.safari} subtitle={dict.booking.requestNote}>
        <CurrencyNote dict={dict} locale={locale} />
        <div className="mt-4">
          <CatalogGrid items={safaris} locale={locale} dict={dict} />
        </div>
      </Section>
      <Section title={dict.common.gallery} tone="grey">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(["safariDunes", "safariConvoy", "safariCamels3", "safariAtv"] as const).map((p) => (
            <div key={p} className="relative aspect-[4/3] overflow-hidden rounded-2xl"><Photo name={p} sizes="(max-width: 1024px) 50vw, 25vw" /></div>
          ))}
        </div>
      </Section>
    </>
  );
}
