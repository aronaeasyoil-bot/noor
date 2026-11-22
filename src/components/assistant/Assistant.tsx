"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { Icon, WhatsAppIcon } from "@/components/icons";
import { whatsappLink } from "@/lib/contact";

type Labels = { title: string; intro: string; placeholder: string; send: string; handoff: string; open: string };
type Msg = { role: "user" | "assistant"; text: string; links?: { href: string; label: string }[] };

/** Multilingual help assistant. Answers come from NOOR's knowledge base; it never quotes prices or availability. */
export function Assistant({ locale, labels, whatsappPrefill }: { locale: Locale; labels: Labels; whatsappPrefill: string }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", text: labels.intro }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs, open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const history = [...msgs, { role: "user" as const, text }];
    setMsgs(history);
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, message: text, history: history.slice(-6).map((m) => ({ role: m.role, text: m.text })) }),
      });
      const data = (await res.json()) as { answer?: string; links?: Msg["links"] };
      setMsgs((m) => [...m, { role: "assistant", text: data.answer ?? labels.handoff, links: data.links }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", text: labels.handoff }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="noor-assistant"
        aria-label={labels.open}
        title={labels.open}
        data-testid="assistant-toggle"
        className="fixed end-4 bottom-[calc(136px+env(safe-area-inset-bottom))] z-40 grid size-12 place-items-center rounded-full bg-noor-navy text-white shadow-lg transition hover:bg-noor-red lg:end-6 lg:bottom-24"
      >
        <Icon name={open ? "close" : "sparkles"} size={22} />
      </button>
      {open && (
        <section
          id="noor-assistant"
          role="dialog"
          aria-label={labels.title}
          data-testid="assistant-panel"
          className="fixed end-4 bottom-[calc(196px+env(safe-area-inset-bottom))] z-50 flex max-h-[60dvh] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-noor-line bg-white shadow-2xl lg:end-6 lg:bottom-40"
        >
          <header className="flex items-center justify-between bg-noor-navy px-4 py-3 text-white">
            <p className="font-extrabold">{labels.title}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded p-1 hover:bg-white/10">
              <Icon name="close" size={18} />
            </button>
          </header>
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "ms-auto bg-noor-blue text-white" : "bg-noor-bg text-noor-ink"}`}>
                <p className="whitespace-pre-line">{m.text}</p>
                {m.links && m.links.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {m.links.map((l) => (
                      <li key={l.href}><a className="font-bold text-noor-blue underline" href={l.href}>{l.label}</a></li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {busy && <p className="text-xs text-noor-muted">…</p>}
          </div>
          <a href={whatsappLink(whatsappPrefill)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 border-t border-noor-line bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
            <WhatsAppIcon size={16} /> {labels.handoff}
          </a>
          <form onSubmit={send} className="flex gap-2 border-t border-noor-line p-3">
            <label htmlFor="assistant-input" className="sr-only">{labels.placeholder}</label>
            <input id="assistant-input" value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} placeholder={labels.placeholder} className="field flex-1" autoComplete="off" />
            <button className="btn btn-primary px-4" disabled={busy || !input.trim()}>{labels.send}</button>
          </form>
        </section>
      )}
    </>
  );
}
