import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { getCurrentUser } from "@/lib/auth/session";
import { hotelAreas } from "@/lib/catalog";
import { todayInDubai } from "@/lib/format";
import type { SearchIssue } from "@/lib/validation/search";
import { SearchPanel, type SearchTab } from "./SearchPanel";
import { SupplierNotice } from "./SupplierNotice";
import { SearchSummary } from "./SearchSummary";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { serviceOptions } from "@/components/catalog/serviceOptions";

/**
 * Result page for searches that have no live supplier yet: shows the exact search, an honest notice,
 * and sends the search to NOOR advisers as a quote request (stored in the database).
 */
export async function RequestResults({
  locale,
  dict,
  tab,
  title,
  issues,
  rows,
  notice,
  service,
  context,
}: {
  locale: Locale;
  dict: Dictionary;
  tab: SearchTab;
  title: string;
  issues: Record<string, SearchIssue> | null;
  rows: [string, string][];
  notice: string;
  service: string;
  context: Record<string, unknown>;
}) {
  const today = todayInDubai();
  if (issues) {
    return (
      <div className="container-noor py-8">
        <h1 className="mb-4 text-2xl font-extrabold">{title}</h1>
        <ul className="mb-4 space-y-1 rounded-xl bg-red-50 p-4 text-sm font-semibold text-noor-red" role="alert">
          {Object.entries(issues).map(([k, v]) => (
            <li key={k}>{dict.search.errors[v]}</li>
          ))}
        </ul>
        <SearchPanel locale={locale} labels={dict.search} today={today} initialTab={tab} areaSuggestions={hotelAreas.map((a) => a.name[locale])} />
      </div>
    );
  }
  const user = await getCurrentUser();
  return (
    <div className="container-noor py-8">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-4">
          <SearchSummary title={dict.supplier.searchSummary} rows={rows} />
          <SupplierNotice title={dict.supplier.notConnectedTitle} body={notice} />
        </div>
        <aside id="request" className="card h-fit min-w-0 p-5">
          <h2 className="mb-3 text-lg font-extrabold">{dict.supplier.sendSearch}</h2>
          <QuoteForm
            compact
            locale={locale}
            q={dict.quote}
            c={dict.common}
            rateLimited={dict.auth.rateLimited}
            services={serviceOptions(locale, dict)}
            defaultService={service}
            context={context}
            defaultMessage={rows.map(([k, v]) => `${k}: ${v}`).join("\n")}
            whatsappPrefill={dict.whatsapp.prefill}
            user={user}
          />
        </aside>
      </div>
    </div>
  );
}
