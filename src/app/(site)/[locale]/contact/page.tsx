import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth/session";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/contact";
import { PageHero } from "@/components/ui/PageHero";
import { Icon, WhatsAppIcon } from "@/components/icons";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { serviceOptions } from "@/components/catalog/serviceOptions";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: getDictionary(await resolveLocale(params)).extra.contactTitle };
}

export default async function ContactPage({ params }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const user = await getCurrentUser();
  return (
    <>
      <PageHero compact photo="support" title={dict.extra.contactTitle} subtitle={dict.extra.contactSub} />
      <div className="container-noor grid gap-8 py-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <a href={whatsappLink(dict.whatsapp.prefill)} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-4 p-5 hover:border-whatsapp" data-testid="contact-whatsapp">
            <span className="grid size-12 place-items-center rounded-full bg-whatsapp text-white"><WhatsAppIcon size={24} /></span>
            <span>
              <span className="block font-extrabold">{dict.extra.whatsappNumber}</span>
              <span className="block text-noor-muted" dir="ltr">{WHATSAPP_DISPLAY}</span>
            </span>
          </a>
          <div className="card flex items-center gap-4 p-5">
            <span className="grid size-12 place-items-center rounded-full bg-noor-navy text-white"><Icon name="pin" size={22} /></span>
            <span>
              <span className="block font-extrabold">{dict.extra.office}</span>
              <span className="block text-noor-muted">{dict.extra.officeValue}</span>
            </span>
          </div>
        </div>
        <div className="card p-5 sm:p-8">
          <h2 className="mb-4 text-xl font-extrabold">{dict.common.message}</h2>
          <QuoteForm locale={locale} q={dict.quote} c={dict.common} rateLimited={dict.auth.rateLimited} services={serviceOptions(locale, dict)} defaultService="other" context={{ page: "contact" }} whatsappPrefill={dict.whatsapp.prefill} user={user} />
        </div>
      </div>
    </>
  );
}
