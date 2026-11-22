import type { CatalogItem } from "@/lib/catalog";
import { itemPath } from "@/lib/catalog";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { getProducts } from "@/lib/products";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { Price } from "@/components/ui/Price";
import { Fav } from "./Fav";

export async function CatalogGrid({ items, locale, dict, cols = "lg:grid-cols-3", withPrice = true }: { items: CatalogItem[]; locale: Locale; dict: Dictionary; cols?: string; withPrice?: boolean }) {
  const products = await getProducts(items.map((i) => i.slug));
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${cols}`}>
      {items.map((it) => (
        <div key={it.slug} id={it.slug} className="scroll-mt-28">
          <PhotoCard
            href={`/${locale}${itemPath(it)}`}
            photo={it.photos[0]!}
            title={it.title[locale]}
            subtitle={it.summary[locale]}
            badge={it.duration?.[locale] ?? (it.seats ? `${it.seats} · ${it.bags ?? 0}` : undefined)}
            testId={`card-${it.slug}`}
            action={<Fav type={it.category} slug={it.slug} locale={locale} dict={dict} />}
            footer={withPrice ? <Price product={products.get(it.slug)} dict={dict} locale={locale} /> : <span className="text-sm font-bold text-noor-blue">{dict.sections.requestQuote}</span>}
          />
        </div>
      ))}
    </div>
  );
}
