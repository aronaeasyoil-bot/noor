import Link from "next/link";
import type { ReactNode } from "react";
import type { PhotoKey } from "@/lib/media";
import { Photo } from "./Photo";

/** Photographic card used across the site. The whole card is one link to a real page. */
export function PhotoCard({
  href,
  photo,
  title,
  subtitle,
  badge,
  footer,
  aspect = "aspect-[4/3]",
  sizes = "(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 400px",
  overlay = false,
  testId,
  action,
}: {
  href: string;
  photo: PhotoKey;
  title: string;
  subtitle?: string;
  badge?: string;
  footer?: ReactNode;
  aspect?: string;
  sizes?: string;
  overlay?: boolean;
  testId?: string;
  action?: ReactNode;
}) {
  if (overlay) {
    return (
      <div className="group relative" data-testid={testId}>
        <Link href={href} className={`card relative block overflow-hidden ${aspect}`}>
          <Photo name={photo} sizes={sizes} className="object-cover transition duration-500 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          {badge && <span className="chip absolute start-3 top-3 bg-white/95 text-noor-navy">{badge}</span>}
          <span className="absolute inset-x-0 bottom-0 p-4 text-white">
            <span className="block text-lg leading-tight font-extrabold drop-shadow">{title}</span>
            {subtitle && <span className="mt-0.5 block text-sm opacity-90">{subtitle}</span>}
          </span>
        </Link>
        {action && <div className="absolute end-3 top-3 z-10">{action}</div>}
      </div>
    );
  }
  return (
    <div className="group card relative flex h-full flex-col overflow-hidden" data-testid={testId}>
      <Link href={href} className={`relative block overflow-hidden ${aspect}`} tabIndex={-1} aria-hidden="true">
        <Photo name={photo} sizes={sizes} className="object-cover transition duration-500 group-hover:scale-105" />
        {badge && <span className="chip absolute start-3 top-3 bg-white/95 text-noor-navy">{badge}</span>}
      </Link>
      {action && <div className="absolute end-3 top-3 z-10">{action}</div>}
      <div className="flex flex-1 flex-col p-4">
        <Link href={href} className="text-[15px] leading-snug font-extrabold text-noor-ink after:absolute after:inset-0 hover:text-noor-red sm:text-base">
          {title}
        </Link>
        {subtitle && <p className="mt-1 line-clamp-2 text-sm text-noor-muted">{subtitle}</p>}
        {footer && <div className="relative mt-auto pt-3">{footer}</div>}
      </div>
    </div>
  );
}
