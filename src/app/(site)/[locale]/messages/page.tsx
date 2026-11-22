import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { whatsappLink } from "@/lib/contact";
import { WhatsAppIcon } from "@/components/icons";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: getDictionary(await resolveLocale(params)).extra.messagesTitle };
}

export default async function MessagesPage({ params }: P) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  return (
    <div className="container-noor max-w-2xl py-10">
      <h1 className="text-2xl font-extrabold">{dict.extra.messagesTitle}</h1>
      <p className="mt-2 text-noor-muted">{dict.extra.messagesBody}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a href={whatsappLink(dict.whatsapp.prefill)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp"><WhatsAppIcon size={18} /> {dict.whatsapp.label}</a>
        <Link href={`/${locale}/account/notifications`} className="btn btn-outline">{dict.account.notifications}</Link>
      </div>
    </div>
  );
}
