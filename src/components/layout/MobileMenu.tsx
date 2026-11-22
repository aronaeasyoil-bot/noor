"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { Icon } from "@/components/icons";
import { moreNav, primaryNav } from "./nav";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function MobileMenu({ locale, dict, signedIn }: { locale: Locale; dict: Dictionary; signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const l = (p: string) => `/${locale}${p}`;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="grid size-10 place-items-center rounded-lg text-noor-ink hover:bg-noor-bg"
        aria-label={dict.nav.menu}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        data-testid="mobile-menu-button"
      >
        <Icon name="menu" size={24} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={dict.nav.menu} id="mobile-menu">
          <button type="button" aria-label={dict.nav.close} className="absolute inset-0 bg-noor-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-noor-line px-4 py-3">
              <span className="text-lg font-extrabold text-noor-navy">{dict.nav.menu}</span>
              <button type="button" className="grid size-10 place-items-center rounded-lg hover:bg-noor-bg" aria-label={dict.nav.close} onClick={() => setOpen(false)}>
                <Icon name="close" size={22} />
              </button>
            </div>
            <nav className="px-2 py-3" aria-label={dict.nav.menu}>
              <ul className="grid grid-cols-2 gap-2">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <Link href={l(item.href)} className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl bg-noor-bg px-2 py-3 text-center text-sm font-semibold">
                      <Icon name={item.icon} size={22} className="text-noor-red" />
                      {item.label(dict)}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="mt-3 divide-y divide-noor-line">
                {moreNav.map((item) => (
                  <li key={item.href}>
                    <Link href={l(item.href)} className="flex items-center gap-3 px-3 py-3.5 text-[15px] font-semibold">
                      <Icon name={item.icon} size={20} className="text-noor-navy" />
                      {item.label(dict)}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href={l(signedIn ? "/account" : "/account/sign-in")} className="flex items-center gap-3 px-3 py-3.5 text-[15px] font-semibold">
                    <Icon name="user" size={20} className="text-noor-navy" />
                    {signedIn ? dict.nav.account : dict.nav.signIn}
                  </Link>
                </li>
                <li>
                  <Link href={l("/contact")} className="flex items-center gap-3 px-3 py-3.5 text-[15px] font-semibold">
                    <Icon name="headset" size={20} className="text-noor-navy" />
                    {dict.nav.contact}
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="mt-auto border-t border-noor-line px-4 py-4">
              <p className="field-label">{dict.nav.language}</p>
              <Suspense fallback={null}>
                <LocaleSwitcher locale={locale} label={dict.nav.language} />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
