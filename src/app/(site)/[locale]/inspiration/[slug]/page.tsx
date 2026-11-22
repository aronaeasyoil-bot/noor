import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { articles } from "@/lib/catalog";
import { PageHero } from "@/components/ui/PageHero";

type P = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const a = articles.find((x) => x.slug === slug);
  return a ? { title: a.title[locale], description: a.excerpt[locale] } : {};
}

export default async function ArticlePage({ params }: P) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const a = articles.find((x) => x.slug === slug);
  if (!a) notFound();
  const dict = getDictionary(locale);
  return (
    <article>
      <PageHero photo={a.photo} title={a.title[locale]} subtitle={a.excerpt[locale]} />
      <div className="container-noor prose-noor max-w-3xl space-y-4 py-10">
        {a.body.map((p, i) => <p key={i}>{p[locale]}</p>)}
        <Link href={`/${locale}#inspiration`} className="font-bold text-noor-blue underline">{dict.extra.allArticles}</Link>
      </div>
    </article>
  );
}
