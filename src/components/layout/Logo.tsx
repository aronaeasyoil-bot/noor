import Image from "next/image";
import Link from "next/link";

/**
 * Official NOOR logo, used exactly as supplied (public/brand/noor-logo-official.jpg).
 * The file is not edited; the frame only hides the empty white margin around it.
 */
export function Logo({ href, className = "h-11 w-[140px]" }: { href: string; className?: string }) {
  return (
    <Link href={href} className={`relative block shrink-0 overflow-hidden ${className}`} aria-label="NOOR Travel & Tours">
      <Image
        src="/brand/noor-logo-official.jpg"
        alt="NOOR Travel & Tours"
        fill
        priority
        sizes="180px"
        className="object-cover object-center"
      />
    </Link>
  );
}
