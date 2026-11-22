"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavoriteAction } from "@/app/actions/commerce";
import { Icon } from "@/components/icons";

type Labels = { add: string; remove: string; signIn: string };

export function FavoriteButton({ itemType, itemSlug, initial, signedIn, locale, labels }: { itemType: string; itemSlug: string; initial: boolean; signedIn: boolean; locale: string; labels: Labels }) {
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();
  const label = !signedIn ? labels.signIn : saved ? labels.remove : labels.add;
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={label}
      title={label}
      disabled={pending}
      data-testid={`favorite-${itemSlug}`}
      onClick={(e) => {
        e.preventDefault();
        if (!signedIn) {
          router.push(`/${locale}/account/sign-in?next=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        start(async () => {
          const r = await toggleFavoriteAction(itemType, itemSlug);
          if ("saved" in r) setSaved(r.saved);
        });
      }}
      className="grid size-9 place-items-center rounded-full bg-white/95 text-noor-red shadow-md transition hover:scale-105"
    >
      <Icon name="heart" size={18} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
