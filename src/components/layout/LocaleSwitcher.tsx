"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { localeNames, locales, type Locale } from "@/lib/i18n/config";

export function LocaleSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? `/${locale}`;
  const search = useSearchParams();
  const rest = pathname.replace(/^\/(en|fr|ar)(?=\/|$)/, "");
  const qs = search?.toString();
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      {locales.map((l) => (
        <a
          key={l}
          href={`/${l}${rest}${qs ? `?${qs}` : ""}`}
          hrefLang={l}
          lang={l}
          aria-current={l === locale ? "true" : undefined}
          className={`rounded-md px-2 py-1 text-xs font-semibold ${
            l === locale ? "bg-noor-navy text-white" : "text-noor-muted hover:bg-noor-bg"
          }`}
        >
          {l === "ar" ? "ع" : l.toUpperCase()}
          <span className="sr-only"> {localeNames[l]}</span>
        </a>
      ))}
    </div>
  );
}
