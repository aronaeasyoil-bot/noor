import { photos, type PhotoKey } from "@/lib/media";
import { SafeImage } from "./SafeImage";

type Props = {
  name: PhotoKey;
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  quality?: number;
};

/** A registered, licensed photo rendered with next/image (resized by the Unsplash CDN). */
export function Photo({ name, alt, sizes, priority, className, quality }: Props) {
  const p = photos[name];
  return (
    <SafeImage
      src={p.src}
      alt={alt ?? p.alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={className ?? "object-cover"}
    />
  );
}
