import Link from "next/link";
import type { ReactNode } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { signOutAction } from "@/app/actions/auth";

/** Account area layout: side menu on desktop, horizontal scroller on phones. */
export function AccountShell({ locale, dict, active, title, children }: { locale: Locale; dict: Dictionary; active: string; title: string; children: ReactNode }) {
  const a = dict.account;
  const items = [
    ["", a.profile],
    ["/bookings", a.bookings],
    ["/quotes", a.quotes],
    ["/visas", a.visas],
    ["/favorites", a.favorites],
    ["/travellers", a.travellers],
    ["/notifications", a.notifications],
  ] as const;
  return (
    <div className="container-noor grid gap-6 py-8 lg:grid-cols-[240px_1fr]">
      <nav aria-label={a.title} className="lg:sticky lg:top-28 lg:self-start">
        <ul className="scroll-row lg:flex lg:flex-col lg:gap-1 lg:overflow-visible">
          {items.map(([href, label]) => (
            <li key={href} className="shrink-0">
              <Link
                href={`/${locale}/account${href}`}
                aria-current={active === href ? "page" : undefined}
                className={`block rounded-xl px-4 py-2.5 text-sm font-bold ${active === href ? "bg-noor-red text-white" : "bg-noor-bg text-noor-ink hover:bg-red-50 lg:bg-transparent"}`}
              >
                {label}
              </Link>
            </li>
          ))}
          <li className="shrink-0">
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button className="block w-full rounded-xl px-4 py-2.5 text-start text-sm font-bold text-noor-muted hover:bg-noor-bg" data-testid="signout">{dict.nav.signOut}</button>
            </form>
          </li>
        </ul>
      </nav>
      <section className="min-w-0">
        <h1 className="mb-5 text-2xl font-extrabold">{title}</h1>
        {children}
      </section>
    </div>
  );
}
