import Link from "next/link";
import { Suspense } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { SessionUser } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/roles";
import { Icon } from "@/components/icons";
import { Logo } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { MobileMenu } from "./MobileMenu";
import { moreNav, primaryNav } from "./nav";
import { signOutAction } from "@/app/actions/auth";

type Props = { locale: Locale; dict: Dictionary; user: SessionUser | null; currency: string };

export function Header({ locale, dict, user, currency }: Props) {
  const l = (p: string) => `/${locale}${p}`;
  return (
    <header className="sticky top-0 z-40 border-b border-noor-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2">
        {dict.nav.skip}
      </a>
      <div className="container-noor flex h-16 items-center gap-3">
        <MobileMenu locale={locale} dict={dict} signedIn={!!user} />
        <Logo href={l("")} className="h-10 w-[128px] sm:h-12 sm:w-[154px]" />

        <div className="ms-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-3 md:flex">
            <Suspense fallback={null}>
              <LocaleSwitcher locale={locale} label={dict.nav.language} />
            </Suspense>
            <CurrencySwitcher current={currency} label={dict.nav.currency} id="currency-desktop" />
          </div>
          <Link href={l("/account/bookings")} className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-noor-ink hover:bg-noor-bg lg:flex">
            <Icon name="suitcase" size={18} />
            {dict.nav.myBookings}
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              {isStaff(user.role) && (
                <Link href="/admin" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-noor-navy hover:bg-noor-bg lg:block">
                  {dict.nav.admin}
                </Link>
              )}
              <Link href={l("/account")} className="flex items-center gap-2 rounded-full border border-noor-line py-1 ps-1 pe-3 text-sm font-semibold hover:border-noor-navy">
                <span className="grid size-8 place-items-center rounded-full bg-noor-navy text-xs font-bold text-white">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-28 truncate sm:inline">{user.name.split(" ")[0]}</span>
              </Link>
              <form action={signOutAction} className="hidden lg:block">
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" className="rounded-lg p-2 text-noor-muted hover:bg-noor-bg" aria-label={dict.nav.signOut} title={dict.nav.signOut}>
                  <Icon name="logout" size={18} />
                </button>
              </form>
            </div>
          ) : (
            <Link href={l("/account/sign-in")} className="btn btn-navy !min-h-10 !px-3 text-sm sm:!px-4" data-testid="sign-in-link" aria-label={dict.nav.signIn}>
              <Icon name="user" size={16} />
              <span className="hidden sm:inline">{dict.nav.signIn}</span>
              <span className="hidden min-[400px]:inline sm:hidden">{dict.auth.signIn}</span>
            </Link>
          )}
        </div>
      </div>

      <nav aria-label="Services" className="hidden border-t border-noor-line lg:block">
        <ul className="container-noor flex h-12 items-center gap-1 text-sm font-semibold">
          {primaryNav.map((item) => (
            <li key={item.href}>
              <Link href={l(item.href)} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-noor-ink hover:bg-noor-bg hover:text-noor-red">
                <Icon name={item.icon} size={17} />
                {item.label(dict)}
              </Link>
            </li>
          ))}
          <li className="relative">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-3 py-2 text-noor-ink hover:bg-noor-bg [&::-webkit-details-marker]:hidden">
                {dict.nav.more}
                <Icon name="chevronDown" size={16} className="transition group-open:rotate-180" />
              </summary>
              <ul className="card absolute end-0 top-11 z-50 w-64 p-2">
                {moreNav.map((item) => (
                  <li key={item.href}>
                    <Link href={l(item.href)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-noor-bg">
                      <Icon name={item.icon} size={18} className="text-noor-red" />
                      {item.label(dict)}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        </ul>
      </nav>
    </header>
  );
}
