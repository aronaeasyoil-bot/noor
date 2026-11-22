import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { Photo } from "@/components/ui/Photo";

/** Entry point for rental partners. Approved suppliers (role "supplier") manage their fleet in /admin. */
export async function SupplierPortal({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const user = await getCurrentUser();
  const isSupplier = user?.role === "supplier";
  return (
    <div className="grid items-center gap-6 lg:grid-cols-2">
      <div className="relative aspect-[16/9] overflow-hidden rounded-3xl">
        <Photo name="carChauffeur" sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
      <div>
        <p className="text-noor-muted">{dict.extra.supplierPortalBody}</p>
        <Link href={isSupplier ? "/admin" : `/${locale}/quote?service=other&topic=partner`} className="btn btn-navy mt-5" data-testid="supplier-portal">
          {isSupplier ? dict.extra.supplierPortalSignedIn : dict.extra.supplierPortalCta}
        </Link>
      </div>
    </div>
  );
}
