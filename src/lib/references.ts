const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion on the phone

/** Human-friendly reference, e.g. NB-7K3QX9 for bookings, NQ- for quotes, NV- for visa files. */
export function makeReference(prefix: "NB" | "NQ" | "NV"): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let s = "";
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return `${prefix}-${s}`;
}
