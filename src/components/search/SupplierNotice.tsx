import { Icon } from "@/components/icons";

/** Honest notice shown when a search needs a supplier that is not connected yet. */
export function SupplierNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950" role="status" data-testid="supplier-notice">
      <Icon name="info" size={22} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-extrabold">{title}</p>
        <p className="mt-1 text-sm">{body}</p>
      </div>
    </div>
  );
}
