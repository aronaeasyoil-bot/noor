import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons";

export function Section({
  id,
  title,
  subtitle,
  href,
  hrefLabel,
  children,
  className = "",
  tone = "white",
}: {
  id?: string;
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  children: ReactNode;
  className?: string;
  tone?: "white" | "grey";
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={`${tone === "grey" ? "bg-noor-bg" : ""} py-10 sm:py-14 ${className}`}>
      <div className="container-noor">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
          <div>
            <h2 id={id ? `${id}-title` : undefined} className="text-[22px] leading-tight font-extrabold tracking-tight text-noor-ink sm:text-[28px]">
              {title}
            </h2>
            {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-noor-muted sm:text-base">{subtitle}</p>}
          </div>
          {href && hrefLabel && (
            <Link href={href} className="hidden shrink-0 items-center gap-1 text-sm font-bold text-noor-blue hover:underline sm:flex">
              {hrefLabel}
              <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
            </Link>
          )}
        </div>
        {children}
        {href && hrefLabel && (
          <Link href={href} className="btn btn-outline mt-5 w-full sm:hidden">
            {hrefLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
