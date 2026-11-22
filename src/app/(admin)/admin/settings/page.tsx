import { requirePermission } from "@/lib/auth/session";
import { getRates } from "@/lib/currency";
import { refreshRatesAction } from "@/app/actions/admin";
import { AdminShell, Table, dt } from "@/components/admin/AdminShell";

export const metadata = { title: "Settings" };

export default async function AdminSettings({ searchParams }: { searchParams: Promise<{ rates?: string }> }) {
  const user = await requirePermission("settings");
  const sp = await searchParams;
  const rates = await getRates();
  return (
    <AdminShell user={user} title="Settings">
      <h2 className="mb-2 text-lg font-extrabold">Exchange rates (base AED)</h2>
      {sp.rates && <p className={`mb-3 rounded-lg p-3 text-sm font-semibold ${sp.rates === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-noor-red"}`}>{sp.rates === "ok" ? "Rates updated." : "Rate provider unreachable. Previous rates kept."}</p>}
      <p className="mb-3 text-sm text-noor-muted">Source: {rates.source ?? "—"} · Date: {dt(rates.date)}. Billing is always in AED; other currencies are display only.</p>
      <Table head={["Currency", "1 AED ="]} rows={Object.entries(rates.rates).map(([c, r]) => [c, r?.toFixed(4) ?? "—"])} empty="No rates stored yet." />
      <form action={refreshRatesAction} className="mt-3"><button className="btn btn-navy">Refresh now</button></form>
    </AdminShell>
  );
}
