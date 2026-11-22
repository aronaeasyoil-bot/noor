import { whatsappLink } from "@/lib/contact";
import { WhatsAppIcon } from "./icons";

/**
 * Floating WhatsApp button on every public page. Sits above the mobile bottom navigation and
 * collapses to an icon on small screens so it never covers booking buttons.
 */
export function WhatsAppButton({ label, short, prefill }: { label: string; short: string; prefill: string }) {
  return (
    <a
      href={whatsappLink(prefill)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      data-testid="whatsapp-float"
      className="group fixed bottom-[calc(76px+env(safe-area-inset-bottom))] right-4 z-30 flex items-center gap-2 rounded-full bg-whatsapp p-3 text-white shadow-[var(--shadow-float)] transition hover:bg-whatsapp-dark lg:bottom-6 lg:right-6 lg:py-3 lg:ps-3 lg:pe-5"
    >
      <WhatsAppIcon size={28} />
      <span className="hidden max-w-[15rem] text-sm leading-tight font-bold lg:block">{label}</span>
      <span className="sr-only lg:hidden">{short}</span>
    </a>
  );
}
