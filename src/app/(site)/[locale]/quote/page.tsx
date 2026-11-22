import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth/session";
import { PageHero } from "@/components/ui/PageHero";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { serviceOptions } from "@/components/catalog/serviceOptions";

type P = { params: Promise<{ locale: string }>; searchParams: Promise<{ service?: string; topic?: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: getDictionary(await resolveLocale(params)).quote.title };
}

export default async function QuotePage({ params, searchParams }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const sp = await searchParams;
  const options = serviceOptions(locale, dict);
  const service = options.some((o) => o.value === sp.service) ? sp.service : undefined;
  const user = await getCurrentUser();
  return (
    <>
      <PageHero compact photo="support" title={dict.quote.title} subtitle={dict.quote.subtitle} />
      <div className="container-noor py-10">
        <div className="card mx-auto max-w-3xl p-5 sm:p-8">
          <QuoteForm
            locale={locale}
            q={dict.quote}
            c={dict.common}
            rateLimited={dict.auth.rateLimited}
            services={options}
            defaultService={service}
            context={sp.topic === "partner" ? { topic: "supplier-partnership" } : undefined}
            defaultMessage={sp.topic === "partner" ? `${dict.extra.partnerApply}: ` : undefined}
            whatsappPrefill={dict.whatsapp.prefill}
            user={user}
          />
          <p className="mt-4 text-sm text-noor-muted">{dict.quote.orWhatsapp}</p>
        </div>
      </div>
    </>
  );
}
