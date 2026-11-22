import type { ReactNode } from "react";
import type { PhotoKey } from "@/lib/media";
import { Photo } from "./Photo";

/** Photographic page header used by every commercial page. */
export function PageHero({ photo, title, subtitle, children, compact }: { photo: PhotoKey; title: string; subtitle?: string; children?: ReactNode; compact?: boolean }) {
  return (
    <section className="relative isolate overflow-hidden bg-noor-navy">
      <Photo name={photo} priority sizes="100vw" className="-z-10 object-cover opacity-55" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-noor-navy/60 via-noor-navy/30 to-noor-navy/85" />
      <div className={`container-noor ${compact ? "py-8 sm:py-10" : "pt-8 pb-10 sm:pt-14 sm:pb-14"}`}>
        <h1 className="max-w-3xl text-[28px] leading-tight font-extrabold tracking-tight text-white sm:text-[42px]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-white/90 sm:text-lg">{subtitle}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
