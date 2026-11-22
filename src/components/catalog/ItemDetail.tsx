import Link from "next/link";
import type { CatalogItem } from "@/lib/catalog";
import { airports } from "@/lib/catalog";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { getProduct, getOpenSlots, isBookableOnline } from "@/lib/products";
import { getCurrentUser } from "@/lib/auth/session";
import { paymentsEnabled } from "@/lib/payments";
import { todayInDubai } from "@/lib/format";
import { Photo } from "@/components/ui/Photo";
import { Price } from "@/components/ui/Price";
import { Icon } from "@/components/icons";
import { BookingForm } from "@/components/booking/BookingForm";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { CurrencyNote } from "@/components/ui/CurrencyNote";
import { Fav } from "./Fav";
import { serviceOptions } from "./serviceOptions";

type Crumb = { href: string; label: string };

/** Full product page: gallery, programme, inclusions, policy, and a booking or quote panel. */
export async function ItemDetail({ item, locale, dict, crumbs, path }: { item: CatalogItem; locale: Locale; dict: Dictionary; crumbs: Crumb[]; path: string }) {
  const [product, user] = await Promise.all([getProduct(item.slug), getCurrentUser()]);
  const today = todayInDubai();
  const quoteOnly = item.category === "package" || item.category === "service";
  const requiresSlot = product?.requiresSlot ?? item.requiresSlot ?? false;
  const slots = !quoteOnly && requiresSlot ? await getOpenSlots(item.slug, today) : [];
  const canPay = isBookableOnline(product) && paymentsEnabled();
  const [main, ...rest] = item.photos;
  const t = (l: { en: string; fr: string; ar: string }) => l[locale];
  const kind = item.category === "transfer" ? "transfer" : item.category === "car" ? "car" : "experience";

  return (
    <article className="pb-14">
      <div className="container-noor pt-4">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-noor-muted">
          <ol className="flex flex-wrap items-center gap-1">
            {crumbs.map((c) => (
              <li key={c.href} className="flex items-center gap-1">
                <Link href={c.href} className="hover:text-noor-blue hover:underline">{c.label}</Link>
                <Icon name="chevronRight" size={14} className="rtl:rotate-180" />
              </li>
            ))}
            <li aria-current="page" className="font-semibold text-noor-ink">{t(item.title)}</li>
          </ol>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-noor-ink sm:text-4xl">{t(item.title)}</h1>
            <p className="mt-2 max-w-3xl text-noor-muted">{t(item.summary)}</p>
          </div>
          <Fav type={item.category} slug={item.slug} locale={locale} dict={dict} />
        </div>

        <section aria-label={dict.common.gallery} className="mt-5 grid gap-2 sm:grid-cols-3 sm:grid-rows-2" data-testid="gallery">
          {main && (
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-[420px]">
              <Photo name={main} priority sizes="(max-width: 640px) 100vw, 66vw" />
            </div>
          )}
          {rest.slice(0, 2).map((p) => (
            <div key={p} className="relative hidden aspect-[16/10] overflow-hidden rounded-2xl sm:block">
              <Photo name={p} sizes="33vw" />
            </div>
          ))}
        </section>
      </div>

      <div className="container-noor mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0 space-y-8">
          <div className="flex flex-wrap gap-2">
            {item.duration && (
              <span className="chip bg-noor-bg text-noor-ink"><Icon name="clock" size={16} /> {dict.common.duration}: {t(item.duration)}</span>
            )}
            {item.seats && <span className="chip bg-noor-bg text-noor-ink"><Icon name="users" size={16} /> {item.seats}</span>}
            {item.bags && <span className="chip bg-noor-bg text-noor-ink"><Icon name="luggage" size={16} /> {item.bags}</span>}
          </div>
          <section>
            <h2 className="text-xl font-extrabold">{dict.common.description}</h2>
            <p className="prose-noor mt-2">{t(item.description)}</p>
          </section>
          {item.programme && item.programme.length > 0 && (
            <section>
              <h2 className="text-xl font-extrabold">{dict.common.programme}</h2>
              <ol className="mt-3 space-y-3 border-s-2 border-noor-gold/60 ps-5">
                {item.programme.map((s, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -start-[27px] top-1 size-3 rounded-full bg-noor-red ring-4 ring-white" />
                    {t(s)}
                  </li>
                ))}
              </ol>
            </section>
          )}
          {(item.included || item.excluded) && (
            <section className="grid gap-6 sm:grid-cols-2">
              {item.included && (
                <div>
                  <h2 className="text-lg font-extrabold">{dict.common.included}</h2>
                  <ul className="mt-2 space-y-2">
                    {item.included.map((s, i) => (
                      <li key={i} className="flex gap-2"><Icon name="check" size={18} className="mt-0.5 shrink-0 text-emerald-600" />{t(s)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.excluded && (
                <div>
                  <h2 className="text-lg font-extrabold">{dict.common.excluded}</h2>
                  <ul className="mt-2 space-y-2">
                    {item.excluded.map((s, i) => (
                      <li key={i} className="flex gap-2"><Icon name="close" size={18} className="mt-0.5 shrink-0 text-noor-muted" />{t(s)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
          <section>
            <h2 className="text-lg font-extrabold">{dict.common.cancellation}</h2>
            <p className="mt-2 text-noor-muted">{product?.cancellationPolicy ?? dict.common.priceOnRequest}</p>
          </section>
          {rest.length > 0 && (
            <section className="sm:hidden">
              <h2 className="text-lg font-extrabold">{dict.common.gallery}</h2>
              <div className="scroll-row mt-3">
                {rest.map((p) => (
                  <div key={p} className="relative aspect-[4/3] w-64 shrink-0 overflow-hidden rounded-xl"><Photo name={p} sizes="256px" /></div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start" id="book">
          <div className="card p-5">
            <Price product={product} dict={dict} locale={locale} size="lg" />
            <CurrencyNote dict={dict} locale={locale} />
            <hr className="my-4 border-noor-line" />
            <h2 className="mb-3 text-lg font-extrabold">{quoteOnly ? dict.quote.title : canPay ? dict.booking.title : dict.booking.requestTitle}</h2>
            {quoteOnly ? (
              <QuoteForm
                compact
                locale={locale}
                q={dict.quote}
                c={dict.common}
                rateLimited={dict.auth.rateLimited}
                services={serviceOptions(locale, dict)}
                defaultService={item.slug}
                context={{ page: path }}
                whatsappPrefill={`${dict.whatsapp.prefill} ${t(item.title)}`}
                user={user}
              />
            ) : (
              <BookingForm
                locale={locale}
                slug={item.slug}
                kind={kind}
                slots={slots}
                requiresSlot={requiresSlot}
                maxPax={product?.maxPax ?? item.maxPax ?? 20}
                canPay={canPay}
                today={today}
                user={user}
                b={dict.booking}
                c={dict.common}
                s={dict.search}
                signInLabel={dict.auth.signIn}
                rateLimited={dict.auth.rateLimited}
                airports={kind === "transfer" ? airports.map((a) => ({ code: a.code, name: a.name[locale] })) : undefined}
                path={path}
              />
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
