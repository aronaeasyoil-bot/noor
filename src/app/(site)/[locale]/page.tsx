import Link from "next/link";
import { and, desc, eq, gte, isNull, or } from "drizzle-orm";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { getDb } from "@/lib/db";
import { promotions, reviews, users } from "@/lib/db/schema";
import { activities, africaCities, airports, articles, carCategories, hotelAreas, itemPath, packages, popularDestinations, safaris, transferVehicles, trendingRoutes, type CatalogItem } from "@/lib/catalog";
import { getProducts } from "@/lib/products";
import { todayInDubai } from "@/lib/format";
import { whatsappLink } from "@/lib/contact";
import { Photo } from "@/components/ui/Photo";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { Price } from "@/components/ui/Price";
import { Section } from "@/components/ui/Section";
import { SearchPanel } from "@/components/search/SearchPanel";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Fav } from "@/components/catalog/Fav";
import { Icon, WhatsAppIcon, type IconName } from "@/components/icons";
import type { Dictionary } from "@/lib/i18n";

async function loadDealsAndReviews() {
  const db = await getDb();
  if (!db) return { deals: [], reviews: [] };
  const now = new Date();
  try {
    const [deals, revs] = await Promise.all([
      db
        .select()
        .from(promotions)
        .where(and(eq(promotions.active, true), or(isNull(promotions.validTo), gte(promotions.validTo, now))))
        .orderBy(desc(promotions.createdAt))
        .limit(6),
      db
        .select({ id: reviews.id, rating: reviews.rating, comment: reviews.comment, name: users.name, createdAt: reviews.createdAt })
        .from(reviews)
        .innerJoin(users, eq(users.id, reviews.userId))
        .where(eq(reviews.status, "published"))
        .orderBy(desc(reviews.createdAt))
        .limit(6),
    ]);
    return { deals, reviews: revs };
  } catch (err) {
    console.error("home data failed", err);
    return { deals: [], reviews: [] };
  }
}

function ProductRow({ items, locale, dict, products, wide }: { items: CatalogItem[]; locale: Locale; dict: Dictionary; products: Awaited<ReturnType<typeof getProducts>>; wide?: boolean }) {
  return (
    <div className="scroll-row">
      {items.map((it) => (
        <div key={it.slug} className={`shrink-0 ${wide ? "w-[86%] sm:w-[400px]" : "w-[82%] sm:w-[330px]"}`}>
          <PhotoCard
            href={`/${locale}${itemPath(it)}`}
            photo={it.photos[0]!}
            title={it.title[locale]}
            subtitle={it.summary[locale]}
            badge={it.duration?.[locale]}
            testId={`card-${it.slug}`}
            action={<Fav type={it.category} slug={it.slug} locale={locale} dict={dict} />}
            footer={<Price product={products.get(it.slug)} dict={dict} locale={locale} />}
          />
        </div>
      ))}
    </div>
  );
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const L = (p: string) => `/${locale}${p}`;
  const dubaiSlugs = ["burj-khalifa", "museum-of-the-future", "dubai-marina", "dubai-frame", "palm-jumeirah", "dubai-mall"];
  const dubai = activities.filter((a) => dubaiSlugs.includes(a.slug));
  const otherActivities = activities.filter((a) => !dubaiSlugs.includes(a.slug));
  const [products, { deals, reviews: revs }] = await Promise.all([
    getProducts([...safaris, ...activities, ...packages, ...carCategories, ...transferVehicles].map((i) => i.slug)),
    loadDealsAndReviews(),
  ]);

  const serviceTiles: { href: string; label: string; icon: IconName }[] = [
    { href: L("/flights"), label: dict.nav.flights, icon: "plane" },
    { href: L("/hotels"), label: dict.nav.hotels, icon: "bed" },
    { href: L("/desert-safari"), label: dict.nav.safari, icon: "dunes" },
    { href: L("/transfers"), label: dict.nav.transfers, icon: "transfer" },
    { href: L("/cars"), label: dict.nav.cars, icon: "car" },
    { href: L("/visa"), label: dict.nav.visa, icon: "passport" },
    { href: L("/packages"), label: dict.nav.packages, icon: "suitcase" },
    { href: L("/activities"), label: dict.nav.activities, icon: "ticket" },
  ];

  return (
    <>
      {/* 1. Hero + search */}
      <section className="relative isolate overflow-hidden bg-noor-navy" aria-labelledby="hero-title">
        <Photo name="heroDubai" priority sizes="100vw" className="-z-10 object-cover opacity-60" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-noor-navy/70 via-noor-navy/40 to-noor-navy/90" />
        <div className="container-noor pt-6 pb-8 sm:pt-14 sm:pb-16">
          <p className="chip mb-3 bg-white/15 text-white backdrop-blur">{dict.brand.tagline}</p>
          <h1 id="hero-title" className="max-w-3xl text-[26px] leading-[1.1] font-extrabold tracking-tight text-white sm:text-5xl">
            {dict.hero.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/90 sm:mt-3 sm:text-xl">{dict.hero.subtitle}</p>
          <div className="mt-5 sm:mt-8">
            <SearchPanel locale={locale} labels={dict.search} today={todayInDubai()} areaSuggestions={hotelAreas.map((a) => a.name[locale])} />
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/90">
            {[dict.hero.trust1, dict.hero.trust2, dict.hero.trust3].map((t) => (
              <li key={t} className="flex items-center gap-2"><Icon name="check" size={16} className="text-noor-gold" />{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <nav aria-label={dict.nav.more} className="border-b border-noor-line bg-white">
        <ul className="container-noor scroll-row py-4">
          {serviceTiles.map((s) => (
            <li key={s.href} className="shrink-0">
              <Link href={s.href} className="flex w-24 flex-col items-center gap-2 rounded-xl p-2 text-center text-xs font-bold text-noor-ink hover:bg-noor-bg sm:w-28 sm:text-sm">
                <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-noor-red"><Icon name={s.icon} size={24} /></span>
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 2. Deals: only real promotions entered by NOOR staff */}
      <Section id="deals" title={dict.sections.deals} subtitle={dict.sections.dealsSub}>
        {deals.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((d) => (
              <div key={d.code} className="card flex items-center gap-4 border-s-4 border-noor-gold p-5">
                <Icon name="tag" size={28} className="shrink-0 text-noor-gold" />
                <div>
                  <p className="font-extrabold">{d.description}</p>
                  <p className="mt-1 text-sm text-noor-muted">Code <span className="font-mono font-bold text-noor-ink">{d.code}</span></p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative isolate overflow-hidden rounded-3xl bg-noor-navy p-6 text-white sm:p-10">
            <Photo name="heroYacht" sizes="100vw" className="-z-10 object-cover opacity-40" />
            <p className="max-w-xl text-xl font-extrabold sm:text-2xl">{dict.sections.dealsEmpty}</p>
            <a href={whatsappLink(dict.whatsapp.prefill)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-5">
              <WhatsAppIcon size={18} /> {dict.common.whatsappUs}
            </a>
          </div>
        )}
      </Section>

      {/* 3. Popular destinations */}
      <Section id="destinations" title={dict.sections.popular} subtitle={dict.sections.popularSub} tone="grey" href={L("/flights")} hrefLabel={dict.sections.seeAll}>
        <div className="scroll-row">
          {popularDestinations.map((d) => (
            <div key={d.slug} className="w-[72%] shrink-0 sm:w-[290px]">
              <PhotoCard overlay aspect="aspect-[3/4]" href={L(`/flights?to=${d.iata}`)} photo={d.photo} title={d.name[locale]} subtitle={d.country[locale]} testId={`dest-${d.slug}`} />
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Trending flights: routes only, never invented fares */}
      <Section id="trending-flights" title={dict.sections.trendingFlights} subtitle={dict.sections.trendingFlightsSub} href={L("/flights")} hrefLabel={dict.sections.seeAll}>
        <div className="scroll-row">
          {trendingRoutes.map((r) => (
            <div key={`${r.from}-${r.to}`} className="w-[82%] shrink-0 sm:w-[330px]">
              <PhotoCard
                href={L(`/flights?from=${r.from}&to=${r.to}`)}
                photo={r.photo}
                title={`${r.fromName[locale]} → ${r.toName[locale]}`}
                subtitle={`${r.from} – ${r.to}`}
                footer={<span className="text-sm font-bold text-noor-blue">{dict.sections.searchThisRoute}</span>}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Hotels: areas, not hotels (no supplier inventory yet) */}
      <Section id="hotels" title={dict.sections.hotels} subtitle={dict.sections.hotelsSub} tone="grey" href={L("/hotels")} hrefLabel={dict.sections.seeAll}>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {hotelAreas.map((a) => (
            <PhotoCard key={a.slug} overlay aspect="aspect-[4/3]" href={L(`/hotels?area=${encodeURIComponent(a.name[locale])}`)} photo={a.photo} title={a.name[locale]} subtitle={a.blurb[locale]} />
          ))}
        </div>
      </Section>

      {/* 6. Discover Dubai */}
      <Section id="discover-dubai" title={dict.sections.discoverDubai} subtitle={dict.sections.discoverDubaiSub} href={L("/activities")} hrefLabel={dict.sections.seeAll}>
        <ProductRow items={dubai} locale={locale} dict={dict} products={products} />
      </Section>

      {/* 7. Desert safari */}
      <Section id="safari" title={dict.sections.safari} subtitle={dict.sections.safariSub} tone="grey" href={L("/desert-safari")} hrefLabel={dict.sections.seeAll}>
        <ProductRow items={safaris} locale={locale} dict={dict} products={products} />
      </Section>

      {/* 8. Car rentals */}
      <Section id="cars" title={dict.sections.cars} subtitle={dict.sections.carsSub} href={L("/cars")} hrefLabel={dict.sections.seeAll}>
        <div className="scroll-row">
          {carCategories.map((c) => (
            <div key={c.slug} className="w-[78%] shrink-0 sm:w-[310px]">
              <PhotoCard href={L(`/cars#${c.slug}`)} photo={c.photos[0]!} title={c.title[locale]} subtitle={c.summary[locale]} footer={<Price product={products.get(c.slug)} dict={dict} locale={locale} />} />
            </div>
          ))}
        </div>
      </Section>

      {/* 9. Airport transfers */}
      <section id="transfers" aria-labelledby="transfers-title" className="bg-noor-bg py-10 sm:py-14">
        <div className="container-noor grid items-center gap-6 lg:grid-cols-2">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
            <Photo name="transfersAirport" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          <div>
            <h2 id="transfers-title" className="text-[22px] font-extrabold sm:text-[28px]">{dict.sections.transfers}</h2>
            <p className="mt-1.5 text-noor-muted">{dict.sections.transfersSub}</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {airports.map((a) => (
                <li key={a.code} className="card p-4">
                  <p className="text-2xl font-extrabold text-noor-red">{a.code}</p>
                  <p className="text-sm text-noor-muted">{a.name[locale]}</p>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {transferVehicles.map((v) => (
                <span key={v.slug} className="chip bg-white text-noor-ink"><Icon name="car" size={16} /> {v.title[locale]} · {v.seats}</span>
              ))}
            </div>
            <Link href={L("/transfers")} className="btn btn-primary mt-6">{dict.sections.checkAvailability}</Link>
          </div>
        </div>
      </section>

      {/* 10. Holiday packages */}
      <Section id="packages" title={dict.sections.packages} subtitle={dict.sections.packagesSub} href={L("/packages")} hrefLabel={dict.sections.seeAll}>
        <ProductRow items={packages} locale={locale} dict={dict} products={products} wide />
      </Section>

      {/* 11. Africa to Dubai */}
      <section id="africa" aria-labelledby="africa-title" className="relative isolate overflow-hidden bg-noor-ink py-10 text-white sm:py-14">
        <Photo name="africaHero" sizes="100vw" className="-z-10 object-cover opacity-25" />
        <div className="container-noor">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 id="africa-title" className="text-[22px] font-extrabold sm:text-[28px]">{dict.sections.africa}</h2>
              <p className="mt-1.5 max-w-2xl text-white/80">{dict.sections.africaSub}</p>
            </div>
            <Link href={L("/africa-to-dubai")} className="hidden shrink-0 font-bold text-noor-gold hover:underline sm:block">{dict.sections.seeAll}</Link>
          </div>
          <div className="scroll-row">
            {africaCities.map((c) => (
              <div key={c.slug} className="w-[62%] shrink-0 sm:w-[240px]">
                <PhotoCard overlay aspect="aspect-[3/4]" href={L(`/africa-to-dubai#${c.slug}`)} photo={c.photo} title={c.name[locale]} subtitle={`${c.country[locale]} · ${c.iata} → DXB`} testId={`africa-${c.slug}`} />
              </div>
            ))}
          </div>
          <Link href={L("/africa-to-dubai")} className="btn mt-5 w-full bg-white text-noor-navy sm:hidden">{dict.sections.seeAll}</Link>
        </div>
      </section>

      {/* 12. Tours & activities */}
      <Section id="activities" title={dict.sections.activities} subtitle={dict.sections.activitiesSub} href={L("/activities")} hrefLabel={dict.sections.seeAll}>
        <ProductRow items={otherActivities} locale={locale} dict={dict} products={products} />
      </Section>

      {/* 13. Why NOOR */}
      <Section id="why" title={dict.sections.why} tone="grey">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dict.why.map((w, i) => (
            <div key={w.title} className="card p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-noor-navy text-white">
                <Icon name={(["pin", "headset", "tag", "shield"] as const)[i] ?? "check"} size={22} />
              </span>
              <h3 className="mt-3 font-extrabold">{w.title}</h3>
              <p className="mt-1 text-sm text-noor-muted">{w.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 14. Verified reviews only */}
      <Section id="reviews" title={dict.sections.reviews} subtitle={dict.sections.reviewsSub}>
        {revs.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {revs.map((r) => (
              <figure key={r.id} className="card p-5">
                <div className="flex text-noor-gold" aria-label={`${r.rating}/5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Icon key={i} name="star" size={16} fill={i < r.rating ? "currentColor" : "none"} />
                  ))}
                </div>
                <blockquote className="mt-2 text-sm">{r.comment}</blockquote>
                <figcaption className="mt-3 text-sm font-bold">{r.name.split(" ")[0]}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-noor-line bg-noor-bg p-6 text-center text-noor-muted" data-testid="reviews-empty">{dict.sections.reviewsEmpty}</p>
        )}
      </Section>

      {/* 15. Inspiration */}
      <Section id="inspiration" title={dict.sections.inspiration} subtitle={dict.sections.inspirationSub} tone="grey">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((a) => (
            <PhotoCard key={a.slug} href={L(`/inspiration/${a.slug}`)} photo={a.photo} title={a.title[locale]} subtitle={a.excerpt[locale]} />
          ))}
        </div>
      </Section>

      {/* 16. Newsletter */}
      <section aria-labelledby="newsletter-title" className="bg-noor-red py-10 text-white sm:py-12">
        <div className="container-noor flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <h2 id="newsletter-title" className="text-2xl font-extrabold">{dict.newsletter.title}</h2>
            <p className="mt-1 text-white/90">{dict.newsletter.body}</p>
          </div>
          <div className="w-full max-w-md rounded-2xl bg-white p-3 text-noor-ink">
            <NewsletterForm locale={locale} n={dict.newsletter} error={dict.common.error} />
          </div>
        </div>
      </section>
    </>
  );
}
