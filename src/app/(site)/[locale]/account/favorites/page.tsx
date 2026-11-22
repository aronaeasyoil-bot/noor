import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth/session";
import { getFavoriteKeys } from "@/lib/favorites";
import { allCatalogItems } from "@/lib/catalog";
import { AccountShell } from "@/components/account/AccountShell";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";

type P = { params: Promise<{ locale: string }> };
export const metadata: Metadata = { robots: { index: false } };

export default async function FavoritesPage({ params }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  await requireUser(locale, `/${locale}/account/favorites`);
  const keys = await getFavoriteKeys();
  const items = allCatalogItems.filter((i) => keys.has(`${i.category}:${i.slug}`));
  return (
    <AccountShell locale={locale} dict={dict} active="/favorites" title={dict.account.favorites}>
      {items.length === 0 ? <p className="card p-6 text-noor-muted" data-testid="no-favorites">{dict.common.favoriteAdd} ♡</p> : <CatalogGrid items={items} locale={locale} dict={dict} cols="xl:grid-cols-3" />}
    </AccountShell>
  );
}
