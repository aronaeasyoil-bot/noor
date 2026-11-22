import { requirePermission } from "@/lib/auth/session";
import { locales, localeNames, dir } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { AdminShell, Table } from "@/components/admin/AdminShell";

export const metadata = { title: "Languages" };

function countKeys(o: unknown): number {
  if (typeof o === "string") return 1;
  if (Array.isArray(o)) return o.reduce((n: number, x) => n + countKeys(x), 0);
  if (o && typeof o === "object") return Object.values(o).reduce((n: number, x) => n + countKeys(x), 0);
  return 0;
}

export default async function AdminLanguages() {
  const user = await requirePermission("content");
  return (
    <AdminShell user={user} title="Languages">
      <Table head={["Code", "Language", "Direction", "Interface strings"]} rows={locales.map((l) => [l, localeNames[l], dir(l), countKeys(getDictionary(l))])} />
      <p className="mt-3 text-sm text-noor-muted">Interface texts live in src/lib/i18n/dictionaries (type-checked: a missing translation fails the build). Catalogue texts are in src/lib/catalog.</p>
    </AdminShell>
  );
}
