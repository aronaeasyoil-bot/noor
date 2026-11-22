import "server-only";

type Mail = { to: string; subject: string; text: string; html?: string };

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;
}

/**
 * Sends a transactional email through Resend (works on Workers via fetch).
 * Without RESEND_API_KEY / EMAIL_FROM nothing is sent and the function returns false;
 * callers must not tell the customer that an email was sent in that case.
 */
export async function sendEmail(mail: Mail): Promise<boolean> {
  if (!emailConfigured()) {
    console.warn(`[email not configured] would send "${mail.subject}" to ${mail.to.replace(/(.).+(@.*)/, "$1***$2")}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [mail.to], subject: mail.subject, text: mail.text, html: mail.html }),
    });
    if (!res.ok) console.error("email failed", res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error("email error", err);
    return false;
  }
}

/** Address that receives internal alerts (new booking, new quote, visa file). */
export function opsEmail(): string | null {
  return process.env.OPS_EMAIL ?? null;
}
