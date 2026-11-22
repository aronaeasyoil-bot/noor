import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { bookings } from "@/lib/db/schema";

type P = { params: Promise<{ locale: string; ref: string }> };
export const metadata: Metadata = { robots: { index: false } };

/**
 * Return page after the hosted payment. It NEVER marks anything as paid: it only reads the status
 * written by the signed webhook, and refreshes until the provider has confirmed.
 */
export default async function CheckoutReturn({ params }: P) {
  const locale = await resolveLocale(params);
  const { ref } = await params;
  const dict = getDictionary(locale);
  const user = await requireUser(locale, `/${locale}/checkout/${ref}/return`);
  const db = await getDb();
  if (!db) notFound();
  const [b] = await db.select().from(bookings).where(and(eq(bookings.reference, ref), eq(bookings.userId, user.id))).limit(1);
  if (!b) notFound();
  const paid = b.paymentStatus === "paid";
  return (
    <div className="container-noor max-w-xl py-10">
      {!paid && <meta httpEquiv="refresh" content="5" />}
      <h1 className="text-2xl font-extrabold">{dict.extra.checkoutReturnTitle}</h1>
      <p className={`mt-4 rounded-2xl p-5 font-semibold ${paid ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`} role="status" data-testid="payment-status">
        {paid ? dict.booking.paymentConfirmed : dict.booking.paymentPending}
      </p>
      <Link href={`/${locale}/account/bookings/${b.reference}`} className="btn btn-outline mt-5">{dict.extra.backToBooking}</Link>
    </div>
  );
}
