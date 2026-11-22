import "server-only";
import { notFound } from "next/navigation";
import en, { type Dictionary } from "./dictionaries/en";
import fr from "./dictionaries/fr";
import ar from "./dictionaries/ar";
import { isLocale, type Locale } from "./config";

const dictionaries: Record<Locale, Dictionary> = { en, fr, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Validates the [locale] route segment and returns it, or renders the 404 page. */
export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

export type { Dictionary };
