type LoaderArgs = { src: string; width: number; quality?: number };

/**
 * Image loader that works on Cloudflare Workers without a Next.js image optimizer.
 * Unsplash images are resized and converted by Unsplash's own CDN (imgix parameters);
 * local images in /public are served as-is.
 */
export default function noorImageLoader({ src, width, quality }: LoaderArgs): string {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 72));
    return url.toString();
  }
  return src;
}
