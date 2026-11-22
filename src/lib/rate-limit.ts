/**
 * Best-effort fixed-window limiter kept in the memory of the current isolate/process.
 * It slows down brute force on one instance; for strict global limits, add a Cloudflare WAF
 * rate-limiting rule on the sign-in and reset pages (see DEPLOYMENT.md).
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    if (buckets.size > 10_000) buckets.clear();
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}
