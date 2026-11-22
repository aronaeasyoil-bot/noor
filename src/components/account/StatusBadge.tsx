const tone: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-800",
  paid: "bg-emerald-100 text-emerald-800",
  approved: "bg-emerald-100 text-emerald-800",
  requested: "bg-amber-100 text-amber-900",
  pending_payment: "bg-amber-100 text-amber-900",
  submitted: "bg-amber-100 text-amber-900",
  new: "bg-amber-100 text-amber-900",
  cancelled: "bg-gray-200 text-gray-700",
  refunded: "bg-gray-200 text-gray-700",
  failed: "bg-red-100 text-red-800",
  rejected: "bg-red-100 text-red-800",
};
export function StatusBadge({ status, label }: { status: string; label: string }) {
  return <span className={`chip ${tone[status] ?? "bg-gray-100 text-gray-800"}`} data-testid="status">{label}</span>;
}
