"use client";

import { useId } from "react";

export function Counter({ label, hint, value, min, max, onChange }: { label: string; hint?: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div>
        <p className="text-sm font-bold" id={id}>
          {label}
        </p>
        {hint && <p className="text-xs text-noor-muted">{hint}</p>}
      </div>
      <div className="flex items-center gap-3" role="group" aria-labelledby={id}>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-full border border-noor-line text-lg font-bold disabled:opacity-40"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`${label} −`}
        >
          −
        </button>
        <output className="w-5 text-center font-bold" aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-full border border-noor-line text-lg font-bold disabled:opacity-40"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`${label} +`}
        >
          +
        </button>
      </div>
    </div>
  );
}
