import "server-only";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { kbArticles } from "@/lib/db/schema";
import { allCatalogItems, itemPath } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n/config";

export type AssistantReply = { answer: string; links: { href: string; label: string }[]; source: "kb" | "catalog" | "llm" | "handoff" };

const handoffText: Record<Locale, string> = {
  en: "I don't have a reliable answer to that. A NOOR adviser can help you directly on WhatsApp.",
  fr: "Je n'ai pas de réponse fiable à cette question. Un conseiller NOOR peut vous aider directement sur WhatsApp.",
  ar: "ليست لدي إجابة موثوقة على ذلك. يمكن لأحد مستشاري نور مساعدتك مباشرة عبر واتساب.",
};
const priceText: Record<Locale, string> = {
  en: "I can't quote prices or availability myself: they are confirmed by our team or by our suppliers. Open the page below to see the current price, or send a quote request.",
  fr: "Je ne peux pas annoncer de prix ni de disponibilités : ils sont confirmés par notre équipe ou nos fournisseurs. Ouvrez la page ci-dessous pour voir le tarif en vigueur, ou envoyez une demande de devis.",
  ar: "لا يمكنني تحديد الأسعار أو التوفر بنفسي: يؤكدها فريقنا أو موردونا. افتح الصفحة أدناه لمعرفة السعر الحالي أو أرسل طلب عرض سعر.",
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ");
const words = (s: string) => norm(s).split(/\s+/).filter((w) => w.length > 2);
const pagesText: Record<Locale, string> = {
  en: "These NOOR pages should help. For anything specific, an adviser can answer on WhatsApp.",
  fr: "Ces pages NOOR devraient vous aider. Pour une question précise, un conseiller vous répond sur WhatsApp.",
  ar: "قد تساعدك صفحات نور هذه. لأي سؤال محدد، يجيبك مستشار عبر واتساب.",
};
const PRICE_RE = /(price|prix|cost|co[uû]t|tarif|combien|how much|سعر|كم|availability|disponib|متاح)/i;

function score(q: string[], text: string): number {
  const t = new Set(words(text));
  return q.reduce((n, w) => n + (t.has(w) ? 1 : 0), 0);
}

/** Knowledge-base first; optional LLM (ANTHROPIC_API_KEY) constrained to that knowledge; otherwise hand off. */
export async function answer(locale: Locale, message: string): Promise<AssistantReply> {
  const q = words(message);
  const links = allCatalogItems
    .map((i) => ({ i, s: score(q, `${i.title[locale]} ${i.title.en} ${i.slug.replace(/-/g, " ")}`) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map(({ i }) => ({ href: `/${locale}${itemPath(i)}`, label: i.title[locale] }));

  if (PRICE_RE.test(message)) return { answer: priceText[locale], links: links.length ? links : [{ href: `/${locale}/quote`, label: locale === "fr" ? "Demander un devis" : locale === "ar" ? "طلب عرض سعر" : "Request a quote" }], source: "catalog" };

  const db = await getDb();
  let kb: { question: string; answer: string }[] = [];
  if (db) {
    const rows = await db.select().from(kbArticles).where(and(eq(kbArticles.locale, locale), eq(kbArticles.published, true))).limit(200);
    const ranked = rows.map((r) => ({ r, s: score(q, `${r.question} ${r.keywords}`) })).sort((a, b) => b.s - a.s);
    const best = ranked[0];
    if (best && best.s >= Math.min(2, q.length)) return { answer: best.r.answer, links, source: "kb" };
    kb = rows.map((r) => ({ question: r.question, answer: r.answer }));
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (key && kb.length) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: process.env.ASSISTANT_MODEL ?? "claude-haiku-5-5",
          max_tokens: 400,
          system: `You are the NOOR Travel & Tours website assistant (Dubai). Reply in ${locale === "fr" ? "French" : locale === "ar" ? "Arabic" : "English"}, in at most 4 sentences. Use ONLY the facts in the knowledge base below. Never state or estimate prices, availability, schedules or booking confirmations. If the answer is not in the knowledge base, say so and suggest contacting a NOOR adviser on WhatsApp.\n\nKNOWLEDGE BASE:\n${kb.map((k) => `Q: ${k.question}\nA: ${k.answer}`).join("\n\n").slice(0, 12000)}`,
          messages: [{ role: "user", content: message.slice(0, 500) }],
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { content?: { type: string; text?: string }[] };
        const text = data.content?.find((c) => c.type === "text")?.text?.trim();
        if (text) return { answer: text, links, source: "llm" };
      }
    } catch (err) {
      console.error("assistant llm failed", err);
    }
  }
  if (links.length) return { answer: pagesText[locale], links, source: "catalog" };
  return { answer: handoffText[locale], links: [], source: "handoff" };
}
