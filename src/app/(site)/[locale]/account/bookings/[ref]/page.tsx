import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { bookingStatusLabelKey } from "@/lib/bookings";
import { formatDate, formatMoney } from "@/lib/format";
import { paymentsEnabled } from "@/lib/payments";
import { whatsappLink } from "@/lib/contact";
import { requestCancellationAction, startCheckoutAction } from "@/app/actions/commerce";
import { AccountShell } from "@/components/account/AccountShell";
import { StatusBadge } from "@/components/account/StatusBadge";
import { WhatsAppIcon } from "@/components/icons";

type P = { params: Promise<{ locale: string; ref: string }>; searchParams: Promise<{ new?: string; cancel?: string }> };
export const metadata: Metadata = { robots: { index: false } };

export default async function BookingDetail({ params, searchParams }: P) {
  const locale = await resolveLocale(params);
  const { ref } = await params;
  const sp = await searchParams;
  const dict = getDictionary(locale);
  const b = dict.booking;
  const user = await requireUser(locale, `/${locale}/account/bookings/${ref}`);
  const db = await getDb();
  if (!db) notFound();
  const [bk] = await db.select().from(bookings).where(and(eq(bookings.reference, ref), eq(bookings.userId, user.id))).limit(1);
  if (!bk) notFound();
  const details = bk.details as Record<string, string | number | undefined>;
  const canPay = bk.status === "pending_payment" && bk.paymentStatus !== "paid" && !!bk.amountMinor && paymentsEnabled();
  const canCancel = ["requested", "pending_payment", "confirmed"].includes(bk.status);
  return (
    <AccountShell locale={locale} dict={dict} active="/bookings" title={`${b.title} ${bk.reference}`}>
      {sp.new && (
        <div role="status" className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900" data-testid="booking-created">
          <p className="font-extrabold">{bk.status === "requested" ? b.createdRequest : b.created}</p>
          <p className="text-sm">{b.createdBody.replace("{ref}", bk.reference)}</p>
        </div>
      )}
      {sp.cancel && <p role="status" className="mb-4 rounded-2xl bg-amber-50 p-4 text-amber-900">{b.cancelRequested}</p>}
      <div className="card space-y-4 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold">{String(details.titleLocalized ?? bk.productTitle)}</h2>
          <StatusBadge status={bk.status} label={b[bookingStatusLabelKey[bk.status]]} />
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-noor-muted">{dict.common.reference}</dt><dd className="font-bold">{bk.reference}</dd></div>
          <div><dt className="text-noor-muted">{dict.common.date}</dt><dd className="font-bold">{bk.travelDate ? formatDate(bk.travelDate, locale) : "—"} {details.time ?? ""}</dd></div>
          <div><dt className="text-noor-muted">{dict.common.participants}</dt><dd className="font-bold">{bk.adults} + {bk.children}</dd></div>
          <div><dt className="text-noor-muted">{dict.common.total}</dt><dd className="font-bold">{bk.amountMinor ? formatMoney(bk.amountMinor, bk.currency, locale) : dict.common.priceOnRequest}</dd></div>
          <div><dt className="text-noor-muted">{dict.common.status}</dt><dd className="font-bold">{bk.paymentStatus}</dd></div>
        </dl>
        {bk.status === "requested" && <p className="text-sm text-noor-muted">{b.requestNote}</p>}
        {bk.status === "pending_payment" && !paymentsEnabled() && <p className="text-sm text-noor-muted">{b.paymentUnavailable}</p>}
        <div className="flex flex-wrap gap-3">
          {canPay && (
            <form action={startCheckoutAction}>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="reference" value={bk.reference} />
              <button className="btn btn-primary" data-testid="pay">{b.pay}</button>
            </form>
          )}
          {canCancel && (
            <form action={requestCancellationAction}>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="reference" value={bk.reference} />
              <button className="btn btn-outline" data-testid="cancel-booking">{b.requestCancel}</button>
            </form>
          )}
          <a className="btn btn-whatsapp" href={whatsappLink(`${dict.whatsapp.prefill} (${bk.reference})`)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={18} /> {dict.common.whatsappUs}
          </a>
        </div>
      </div>
    </AccountShell>
  );
}
