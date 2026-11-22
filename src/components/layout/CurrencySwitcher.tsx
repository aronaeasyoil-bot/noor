"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setCurrency } from "@/app/actions/preferences";

const list = ["AED", "USD", "EUR", "XOF", "GBP"];

export function CurrencySwitcher({ current, label, id = "currency" }: { current: string; label: string; id?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <label className="flex items-center gap-1 text-xs font-semibold text-noor-muted" htmlFor={id}>
      <span className="sr-only">{label}</span>
      <select
        id={id}
        data-testid="currency-select"
        value={current}
        disabled={pending}
        onChange={(e) => {
          const v = e.target.value;
          start(async () => {
            await setCurrency(v);
            router.refresh();
          });
        }}
        className="cursor-pointer rounded-md border border-noor-line bg-white px-2 py-1 text-xs font-semibold text-noor-ink"
      >
        {list.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}
