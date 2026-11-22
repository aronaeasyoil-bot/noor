import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/contact";
import { WhatsAppIcon } from "@/components/icons";
import { primaryNav, moreNav } from "./nav";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const l = (p: string) => `/${locale}${p}`;
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 bg-noor-navy text-white/85">
      <div className="container-noor grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xl font-extrabold tracking-wide text-white">NOOR</p>
          <p className="text-sm font-semibold text-noor-gold">{dict.brand.tagline}</p>
          <p className="mt-3 text-sm leading-relaxed">{dict.footer.aboutText}</p>
          <a
            href={whatsappLink(dict.whatsapp.prefill)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp mt-4 !min-h-11"
          >
            <WhatsAppIcon size={20} />
            <span dir="ltr">{WHATSAPP_DISPLAY}</span>
          </a>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold tracking-wider text-white uppercase">{dict.footer.services}</h2>
          <ul className="space-y-2 text-sm">
            {primaryNav.map((i) => (
              <li key={i.href}>
                <Link className="hover:text-white hover:underline" href={l(i.href)}>
                  {i.label(dict)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold tracking-wider text-white uppercase">{dict.nav.more}</h2>
          <ul className="space-y-2 text-sm">
            {moreNav.map((i) => (
              <li key={i.href}>
                <Link className="hover:text-white hover:underline" href={l(i.href)}>
                  {i.label(dict)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold tracking-wider text-white uppercase">{dict.footer.support}</h2>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-white hover:underline" href={l("/contact")}>{dict.footer.contactUs}</Link></li>
            <li><Link className="hover:text-white hover:underline" href={l("/account/bookings")}>{dict.footer.manageBooking}</Link></li>
            <li><Link className="hover:text-white hover:underline" href={l("/quote")}>{dict.sections.requestQuote}</Link></li>
            <li><Link className="hover:text-white hover:underline" href={l("/legal/terms")}>{dict.footer.terms}</Link></li>
            <li><Link className="hover:text-white hover:underline" href={l("/legal/privacy")}>{dict.footer.privacy}</Link></li>
            <li><Link className="hover:text-white hover:underline" href={l("/legal/cookies")}>{dict.footer.cookies}</Link></li>
            <li><Link className="hover:text-white hover:underline" href={l("/legal/credits")}>{dict.footer.credits}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="container-noor flex flex-col gap-2 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} NOOR Travel &amp; Tours · {dict.brand.hq}. {dict.footer.rights}</p>
          <p>{dict.footer.payments}</p>
        </div>
      </div>
    </footer>
  );
}
