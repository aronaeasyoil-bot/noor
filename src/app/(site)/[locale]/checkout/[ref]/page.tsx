import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { formatDate, formatMoney } from "@/lib/format";
import { paymentsEnabled } from "@/lib/payments";
import { startCheckoutAction } from "@/app/actions/commerce";
import { Icon } from "@/components/icons";

type P = { params: Promise<{ locale: string; ref: string }> };
export const metadata: Metadata = { robots: { index: false } };

export default async function CheckoutPage({ params }: P) {
  const locale = await resolveLocale(params);
  const { ref } = await params;
  const dict = getDictionary(locale);
  const user = await requireUser(locale, `/${locale}/checkout/${ref}`);
  const db = await getDb();
  if (!db) notFound();
  const [b] = await db.select().from(bookings).where(and(eq(bookings.reference, ref), eq(bookings.userId, user.id))).limit(1);
  if (!b) notFound();
  const payable = b.status === "pending_payment" && b.paymentStatus !== "paid" && !!b.amountMinor && paymentsEnabled();
  return (
    <div className="container-noor max-w-xl py-10">
      <h1 className="text-2xl font-extrabold">{dict.extra.checkoutTitle}</h1>
      <div className="card mt-5 space-y-3 p-6">
        <p className="font-extrabold">{String((b.details as { titleLocalized?: string }).titleLocalized ?? b.productTitle)}</p>
        <p className="text-sm text-noor-muted">{b.reference} · {b.travelDate ? formatDate(b.travelDate, locale) : ""}</p>
        {b.amountMinor && <p className="text-2xl font-extrabold text-noor-red">{formatMoney(b.amountMinor, b.currency, locale)}</p>}
        {payable ? (
          <form action={startCheckoutAction}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="reference" value={b.reference} />
            <p className="mb-3 flex items-center gap-2 text-sm text-noor-muted"><Icon name="shield" size={16} /> {dict.booking.payNote}</p>
            <button className="btn btn-primary w-full" data-testid="pay">{dict.booking.pay}</button>
          </form>
        ) : (
          <p className="text-sm text-noor-muted">{b.paymentStatus === "paid" ? dict.booking.paymentConfirmed : dict.booking.paymentUnavailable}</p>
        )}
        <Link href={`/${locale}/account/bookings/${b.reference}`} className="inline-block text-sm font-bold text-noor-blue underline">{dict.extra.backToBooking}</Link>
      </div>
    </div>
  );
}
