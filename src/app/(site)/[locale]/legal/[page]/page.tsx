import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { legalPages } from "@/lib/legal";
import { photos, unsplashPage } from "@/lib/media";

type P = { params: Promise<{ locale: string; page: string }> };
const pages = ["terms", "privacy", "cookies", "credits"] as const;
type Page = (typeof pages)[number];

function titleOf(page: Page, d: ReturnType<typeof getDictionary>) {
  return { terms: d.legal.termsTitle, privacy: d.legal.privacyTitle, cookies: d.legal.cookiesTitle, credits: d.legal.creditsTitle }[page];
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { page } = await params;
  return (pages as readonly string[]).includes(page) ? { title: titleOf(page as Page, getDictionary(locale)) } : {};
}

export default async function LegalPage({ params }: P) {
  const locale = await resolveLocale(params);
  const { page } = await params;
  if (!(pages as readonly string[]).includes(page)) notFound();
  const dict = getDictionary(locale);
  const p = page as Page;
  return (
    <div className="container-noor max-w-4xl py-10">
      <h1 className="text-3xl font-extrabold">{titleOf(p, dict)}</h1>
      {p === "credits" ? (
        <>
          <p className="mt-3 text-noor-muted">Photos: Unsplash (Unsplash License). Logo: NOOR Travel & Tours, official.</p>
          <ul className="mt-6 grid gap-2 text-sm sm:grid-cols-2" data-testid="credits">
            {Object.entries(photos).map(([k, ph]) => (
              <li key={k} className="rounded-lg border border-noor-line p-2">
                <a href={unsplashPage(ph)} target="_blank" rel="noopener noreferrer" className="font-semibold text-noor-blue underline">{ph.alt}</a>
                {ph.credit && <span className="block text-noor-muted">{ph.credit}</span>}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-900">{dict.legal.draftNotice}</p>
          <div className="prose-noor mt-6 space-y-4">
            {legalPages[p].map((para, i) => <p key={i}>{para[locale]}</p>)}
          </div>
        </>
      )}
    </div>
  );
}
