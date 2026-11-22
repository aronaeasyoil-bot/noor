import { FavoriteButton } from "@/components/FavoriteButton";
import { getCurrentUser } from "@/lib/auth/session";
import { getFavoriteKeys } from "@/lib/favorites";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/** Server wrapper: reads the saved state once per request. */
export async function Fav({ type, slug, locale, dict }: { type: string; slug: string; locale: Locale; dict: Dictionary }) {
  const [user, keys] = await Promise.all([getCurrentUser(), getFavoriteKeys()]);
  return (
    <FavoriteButton
      itemType={type}
      itemSlug={slug}
      initial={keys.has(`${type}:${slug}`)}
      signedIn={!!user}
      locale={locale}
      labels={{ add: dict.common.favoriteAdd, remove: dict.common.favoriteRemove, signIn: dict.common.signInToSave }}
    />
  );
}
