import { desc } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/session";
import { requireDb } from "@/lib/db";
import { quoteRequests } from "@/lib/db/schema";
import { updateQuoteAction } from "@/app/actions/admin";
import { AdminShell, dt } from "@/components/admin/AdminShell";

export const metadata = { title: "Quote requests" };

export default async function AdminQuotes() {
  const user = await requirePermission("quotes");
  const db = await requireDb();
  const rows = await db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt)).limit(200);
  return (
    <AdminShell user={user} title="Quote requests">
      {rows.length === 0 && <p className="card p-5 text-sm text-noor-muted">No requests yet.</p>}
      <ul className="space-y-3">
        {rows.map((q) => (
          <li key={q.id} className="card grid gap-4 p-4 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0 text-sm">
              <p className="font-extrabold">{q.reference} · {q.service} <span className="font-normal text-noor-muted">· {dt(q.createdAt)} · {q.locale}</span></p>
              <p>{q.name} · <a className="text-noor-blue underline" href={`mailto:${q.email}`}>{q.email}</a> {q.phone && <>· <a className="text-noor-blue underline" href={`https://wa.me/${q.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">{q.phone}</a></>}</p>
              <p className="mt-2 whitespace-pre-line">{q.message}</p>
              <details className="mt-2"><summary className="cursor-pointer text-xs font-bold text-noor-muted">Details</summary><pre className="overflow-x-auto rounded bg-noor-bg p-2 text-xs">{JSON.stringify(q.details, null, 2)}</pre></details>
            </div>
            <form action={updateQuoteAction} className="grid gap-2">
              <input type="hidden" name="id" value={q.id} />
              <select name="status" className="field" defaultValue={q.status} aria-label="Status">
                {["new", "in_progress", "quoted", "closed"].map((s) => <option key={s}>{s}</option>)}
              </select>
              <textarea name="internalNotes" className="field" placeholder="Internal notes" defaultValue={q.internalNotes ?? ""} aria-label="Internal notes" />
              <button className="btn btn-navy">Save</button>
            </form>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
