import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { carCategories } from "@/lib/catalog";
import { ItemDetail } from "@/components/catalog/ItemDetail";

type P = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return carCategories.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const item = carCategories.find((i) => i.slug === slug);
  return item ? { title: item.title[locale], description: item.summary[locale] } : {};
}

export default async function DetailPage({ params }: P) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const item = carCategories.find((i) => i.slug === slug);
  if (!item) notFound();
  const dict = getDictionary(locale);
  return (
    <ItemDetail
      item={item}
      locale={locale}
      dict={dict}
      path={`/${locale}/cars/${slug}`}
      crumbs={[
        { href: `/${locale}`, label: dict.nav.home },
        { href: `/${locale}/cars`, label: dict.nav.cars },
      ]}
    />
  );
}
