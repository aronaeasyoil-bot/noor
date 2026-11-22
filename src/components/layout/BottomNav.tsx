"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { Icon, type IconName } from "@/components/icons";

type Labels = { home: string; bookings: string; favorites: string; messages: string; account: string };

/** App-like bottom navigation on phones and tablets. */
export function BottomNav({ locale, labels }: { locale: Locale; labels: Labels }) {
  const pathname = usePathname() ?? "";
  const items: { href: string; label: string; icon: IconName }[] = [
    { href: `/${locale}`, label: labels.home, icon: "home" },
    { href: `/${locale}/account/bookings`, label: labels.bookings, icon: "suitcase" },
    { href: `/${locale}/account/favorites`, label: labels.favorites, icon: "heart" },
    { href: `/${locale}/messages`, label: labels.messages, icon: "chat" },
    { href: `/${locale}/account`, label: labels.account, icon: "user" },
  ];
  const active = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname === href || (href.endsWith("/account") ? pathname === href : pathname.startsWith(href));

  return (
    <nav
      aria-label="App"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-noor-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      data-testid="bottom-nav"
    >
      <ul className="mx-auto grid h-16 max-w-xl grid-cols-5">
        {items.map((it) => {
          const on = active(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={on ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${on ? "text-noor-red" : "text-noor-muted"}`}
              >
                <Icon name={it.icon} size={22} strokeWidth={on ? 2.2 : 1.8} />
                <span className="max-w-full truncate px-1">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
