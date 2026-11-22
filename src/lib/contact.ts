export const WHATSAPP_NUMBER = "971504921527";
export const WHATSAPP_DISPLAY = "+971 50 492 1527";

/** wa.me link: opens the WhatsApp app on iOS/Android and WhatsApp Web on desktop. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
