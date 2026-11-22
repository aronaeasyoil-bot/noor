import { desc, inArray } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/session";
import { requireDb } from "@/lib/db";
import { visaApplications, visaDocuments } from "@/lib/db/schema";
import { updateVisaAction } from "@/app/actions/admin";
import { AdminShell, dt } from "@/components/admin/AdminShell";

export const metadata = { title: "Visa requests" };

export default async function AdminVisas() {
  const user = await requirePermission("visas");
  const db = await requireDb();
  const apps = await db.select().from(visaApplications).orderBy(desc(visaApplications.createdAt)).limit(200);
  const docs = apps.length ? await db.select().from(visaDocuments).where(inArray(visaDocuments.applicationId, apps.map((a) => a.id))) : [];
  return (
    <AdminShell user={user} title="Visa requests">
      {apps.length === 0 && <p className="card p-5 text-sm text-noor-muted">No applications yet.</p>}
      <ul className="space-y-3">
        {apps.map((a) => (
          <li key={a.id} className="card grid gap-4 p-4 lg:grid-cols-[1fr_320px]">
            <div className="text-sm">
              <p className="font-extrabold">{a.reference} · {a.applicantName}</p>
              <p>{a.nationality} → {a.destination} · {a.visaType} · travel {a.travelDate ?? "—"} · {dt(a.createdAt)}</p>
              {a.message && <p className="mt-1 whitespace-pre-line text-noor-muted">{a.message}</p>}
              <ul className="mt-2 flex flex-wrap gap-2">
                {docs.filter((d) => d.applicationId === a.id).map((d) => (
                  <li key={d.id}><a className="chip bg-noor-bg text-noor-blue underline" href={`/api/visa-documents/${d.id}`} target="_blank" rel="noopener noreferrer">{d.kind}: {d.fileName}</a></li>
                ))}
              </ul>
            </div>
            <form action={updateVisaAction} className="grid gap-2">
              <input type="hidden" name="id" value={a.id} />
              <select name="status" className="field" defaultValue={a.status} aria-label="Status">
                {["submitted", "documents_required", "in_review", "submitted_to_authority", "approved", "rejected", "cancelled"].map((s) => <option key={s}>{s}</option>)}
              </select>
              <textarea name="statusNote" className="field" placeholder="Message shown to the customer" defaultValue={a.statusNote ?? ""} aria-label="Status note" />
              <button className="btn btn-navy">Save</button>
            </form>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
