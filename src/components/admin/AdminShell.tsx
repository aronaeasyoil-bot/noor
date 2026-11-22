import Link from "next/link";
import type { ReactNode } from "react";
import { can, type Permission } from "@/lib/auth/roles";
import type { SessionUser } from "@/lib/auth/session";
import { Logo } from "@/components/layout/Logo";

const nav: { href: string; label: string; perm: Permission }[] = [
  { href: "/admin", label: "Dashboard", perm: "dashboard" },
  { href: "/admin/bookings", label: "Bookings", perm: "bookings" },
  { href: "/admin/quotes", label: "Quote requests", perm: "quotes" },
  { href: "/admin/visas", label: "Visa requests", perm: "visas" },
  { href: "/admin/customers", label: "Customers & users", perm: "customers" },
  { href: "/admin/products", label: "Catalogue & prices", perm: "products" },
  { href: "/admin/availability", label: "Availability", perm: "products" },
  { href: "/admin/suppliers", label: "Suppliers & integrations", perm: "suppliers" },
  { href: "/admin/payments", label: "Payments", perm: "payments" },
  { href: "/admin/refunds", label: "Refunds", perm: "refunds" },
  { href: "/admin/promotions", label: "Promotions", perm: "promotions" },
  { href: "/admin/content", label: "Content, FAQ & reviews", perm: "content" },
  { href: "/admin/media", label: "Media library", perm: "content" },
  { href: "/admin/languages", label: "Languages", perm: "content" },
  { href: "/admin/reports", label: "Reports", perm: "reports" },
  { href: "/admin/settings", label: "Settings", perm: "settings" },
];

export function AdminShell({ user, title, children }: { user: SessionUser; title: string; children: ReactNode }) {
  return (
    <div className="lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-b border-noor-line bg-white lg:min-h-dvh lg:border-e lg:border-b-0">
        <div className="flex items-center justify-between p-4">
          <Logo href="/admin" className="h-9 w-24" />
          <Link href="/en" className="text-xs font-bold text-noor-blue">Site →</Link>
        </div>
        <nav aria-label="Administration">
          <ul className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
            {nav.filter((n) => can(user.role, n.perm)).map((n) => (
              <li key={n.href} className="shrink-0"><Link href={n.href} className="block rounded-lg px-3 py-2 text-sm font-semibold text-noor-ink hover:bg-noor-bg">{n.label}</Link></li>
            ))}
          </ul>
        </nav>
        <p className="hidden px-4 py-3 text-xs text-noor-muted lg:block">{user.name} · {user.role}</p>
      </aside>
      <main className="min-w-0 p-4 sm:p-6">
        <h1 className="mb-5 text-2xl font-extrabold">{title}</h1>
        {children}
      </main>
    </div>
  );
}

export function Table({ head, rows, empty = "No records yet." }: { head: string[]; rows: ReactNode[][]; empty?: string }) {
  if (rows.length === 0) return <p className="card p-5 text-sm text-noor-muted">{empty}</p>;
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-noor-bg text-start text-xs uppercase text-noor-muted">
          <tr>{head.map((h) => <th key={h} className="px-3 py-2 text-start font-bold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-noor-line align-top">{r.map((c, j) => <td key={j} className="px-3 py-2">{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const aed = (minor: number | null | undefined) => (minor == null ? "—" : `AED ${(minor / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
export const dt = (d: Date | string | null | undefined) => (d ? new Date(d).toLocaleString("en-GB", { timeZone: "Asia/Dubai", dateStyle: "medium", timeStyle: "short" }) : "—");
