import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "../../globals.css";
import { arabic, jakarta } from "@/lib/fonts";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { dir, locales } from "@/lib/i18n/config";
import { getCurrentUser } from "@/lib/auth/session";
import { getDisplayCurrency } from "@/lib/currency";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Assistant } from "@/components/assistant/Assistant";

export const viewport: Viewport = {
  themeColor: "#cc0202",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    metadataBase: new URL(base),
    title: { default: d.meta.title, template: `%s · NOOR` },
    description: d.meta.description,
    manifest: "/manifest.webmanifest",
    icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
    appleWebApp: { capable: true, title: "NOOR", statusBarStyle: "default" },
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) },
    openGraph: { title: d.meta.title, description: d.meta.description, images: ["/brand/noor-logo-official.jpg"], siteName: "NOOR Travel & Tours" },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const [user, currency] = await Promise.all([getCurrentUser(), getDisplayCurrency()]);
  return (
    <html lang={locale} dir={dir(locale)} className={`${jakarta.variable} ${arabic.variable}`}>
      <body className="has-bottom-nav min-h-dvh">
        <Header locale={locale} dict={dict} user={user} currency={currency} />
        <main id="main">{children}</main>
        <Footer locale={locale} dict={dict} />
        <WhatsAppButton label={dict.whatsapp.label} short={dict.whatsapp.short} prefill={dict.whatsapp.prefill} />
        <Suspense fallback={null}>
          <Assistant locale={locale} labels={dict.assistant} whatsappPrefill={dict.whatsapp.prefill} />
        </Suspense>
        <BottomNav
          locale={locale}
          labels={{ home: dict.nav.home, bookings: dict.nav.bookings, favorites: dict.nav.favorites, messages: dict.nav.messages, account: dict.nav.account }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}`,
          }}
        />
      </body>
    </html>
  );
}
