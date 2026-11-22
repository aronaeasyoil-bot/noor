/**
 * Seeds NOOR's commercial tables WITHOUT inventing prices:
 * - one products row per catalogue item, status "active", priceMinor NULL (= "price on request");
 * - the first super admin, from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (never hard-coded);
 * - a starter knowledge base for the assistant (facts about NOOR's services, no prices).
 * Safe to run several times (existing rows are kept).
 * Usage: DATABASE_URL=... SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... npm run db:seed
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import { allCatalogItems } from "../src/lib/catalog";
import { hashPassword } from "../src/lib/auth/crypto";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");
const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema });

const items = allCatalogItems.filter((i) => i.category !== "service");
await db
  .insert(schema.products)
  .values(
    items.map((i) => ({
      slug: i.slug,
      category: i.category,
      status: "active" as const,
      priceMinor: null,
      priceUnit: i.priceUnit ?? (i.category === "car" ? "per_day" : i.category === "transfer" ? "per_vehicle" : "per_person"),
      maxPax: i.maxPax ?? (i.seats ?? 20),
      requiresSlot: i.requiresSlot ?? false,
    })),
  )
  .onConflictDoNothing();
console.log(`products: ${items.length} catalogue items ensured (no price set)`);

const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD;
if (email && password) {
  if (password.length < 12) throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters");
  const existing = await db.select({ id: schema.users.id }).from(schema.users).where(sql`lower(${schema.users.email}) = ${email}`);
  if (existing.length === 0) {
    await db.insert(schema.users).values({ email, name: process.env.SEED_ADMIN_NAME ?? "NOOR Super Admin", passwordHash: await hashPassword(password), role: "super_admin" });
    console.log(`super admin created: ${email}`);
  } else console.log("super admin already exists");
}

const kbCount = await db.select({ n: sql<number>`count(*)::int` }).from(schema.kbArticles);
if ((kbCount[0]?.n ?? 0) === 0) {
  const kb: { locale: "en" | "fr" | "ar"; question: string; answer: string; keywords: string }[] = [
    { locale: "en", question: "How do I contact NOOR?", answer: "Chat with a NOOR adviser on WhatsApp at +971 50 492 1527, or send a request from the Contact page. Our team is based in Dubai.", keywords: "contact whatsapp phone adviser agent help" },
    { locale: "fr", question: "Comment contacter NOOR ?", answer: "Écrivez à un conseiller NOOR sur WhatsApp au +971 50 492 1527 ou envoyez une demande depuis la page Contact. Notre équipe est basée à Dubaï.", keywords: "contact whatsapp telephone conseiller agent aide" },
    { locale: "ar", question: "كيف أتواصل مع نور؟", answer: "تحدث مع مستشار نور عبر واتساب على الرقم ‎+971 50 492 1527‎ أو أرسل طلبًا من صفحة التواصل. فريقنا في دبي.", keywords: "تواصل واتساب هاتف مستشار مساعدة" },
    { locale: "en", question: "Does NOOR guarantee my visa?", answer: "No. NOOR helps you prepare and submit your application, but only the competent authorities decide whether a visa is granted.", keywords: "visa guarantee approval refused uae" },
    { locale: "fr", question: "NOOR garantit-il mon visa ?", answer: "Non. NOOR vous aide à préparer et déposer votre dossier, mais seules les autorités compétentes décident d'accorder le visa.", keywords: "visa garantie accord refus emirats" },
    { locale: "ar", question: "هل تضمن نور حصولي على التأشيرة؟", answer: "لا. تساعدك نور في تحضير طلبك وتقديمه، لكن السلطات المختصة وحدها تقرر منح التأشيرة.", keywords: "تأشيرة ضمان موافقة رفض" },
    { locale: "en", question: "How do I pay?", answer: "When a price is confirmed, you pay by card on our payment provider's secure page. NOOR never stores your card number. Your booking is confirmed once the provider confirms the payment.", keywords: "pay payment card secure checkout" },
    { locale: "fr", question: "Comment payer ?", answer: "Une fois le prix confirmé, vous payez par carte sur la page sécurisée de notre prestataire de paiement. NOOR ne conserve jamais votre numéro de carte. La réservation est confirmée après confirmation du paiement par le prestataire.", keywords: "payer paiement carte securise" },
    { locale: "ar", question: "كيف أدفع؟", answer: "بعد تأكيد السعر، تدفع بالبطاقة على صفحة مزود الدفع الآمنة. لا تخزن نور رقم بطاقتك أبدًا. يتأكد الحجز بعد تأكيد مزود الدفع.", keywords: "دفع بطاقة آمن" },
    { locale: "en", question: "Which airports do your transfers cover?", answer: "NOOR airport transfers cover Dubai International (DXB), Al Maktoum International (DWC) and Abu Dhabi (AUH), with sedans, SUVs, vans and luxury cars.", keywords: "transfer airport dxb dwc auh pickup" },
    { locale: "fr", question: "Quels aéroports couvrent vos transferts ?", answer: "Les transferts NOOR couvrent Dubaï International (DXB), Al Maktoum (DWC) et Abou Dhabi (AUH), en berline, SUV, van ou voiture de luxe.", keywords: "transfert aeroport dxb dwc auh" },
    { locale: "ar", question: "ما المطارات التي تغطيها خدمات التوصيل؟", answer: "تغطي خدمات نور مطار دبي الدولي (DXB) ومطار آل مكتوم (DWC) ومطار أبوظبي (AUH) بسيارات سيدان ودفع رباعي وفان وسيارات فاخرة.", keywords: "توصيل مطار dxb dwc auh" },
  ];
  await db.insert(schema.kbArticles).values(kb);
  console.log(`knowledge base: ${kb.length} entries`);
}

await client.end();
