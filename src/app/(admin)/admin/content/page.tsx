import { desc, eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/session";
import { requireDb } from "@/lib/db";
import { kbArticles, reviews, users } from "@/lib/db/schema";
import { moderateReviewAction, saveKbAction } from "@/app/actions/admin";
import { AdminShell, dt } from "@/components/admin/AdminShell";

export const metadata = { title: "Content, FAQ & reviews" };

export default async function AdminContent() {
  const user = await requirePermission("content");
  const db = await requireDb();
  const [kb, revs] = await Promise.all([
    db.select().from(kbArticles).orderBy(desc(kbArticles.createdAt)),
    db.select({ r: reviews, name: users.name }).from(reviews).innerJoin(users, eq(users.id, reviews.userId)).orderBy(desc(reviews.createdAt)).limit(100),
  ]);
  return (
    <AdminShell user={user} title="Content, FAQ & reviews">
      <h2 className="mb-2 text-lg font-extrabold">Assistant knowledge base / FAQ</h2>
      <p className="mb-3 text-sm text-noor-muted">The website assistant answers only from these entries. Never write prices or availability here.</p>
      <ul className="space-y-3">
        {kb.map((k) => (
          <li key={k.id} className="card p-4">
            <form action={saveKbAction} className="grid gap-2 sm:grid-cols-[80px_1fr]">
              <input type="hidden" name="id" value={k.id} />
              <select name="locale" defaultValue={k.locale} className="field" aria-label="Language">{["en", "fr", "ar"].map((l) => <option key={l}>{l}</option>)}</select>
              <input name="question" defaultValue={k.question} className="field" aria-label="Question" />
              <span />
              <textarea name="answer" defaultValue={k.answer} className="field" aria-label="Answer" />
              <span />
              <div className="flex flex-wrap items-center gap-3">
                <input name="keywords" defaultValue={k.keywords} className="field flex-1" placeholder="keywords" aria-label="Keywords" />
                <label className="text-sm"><input type="checkbox" name="published" defaultChecked={k.published} /> published</label>
                <button className="btn btn-navy px-3 py-1.5 text-sm">Save</button>
              </div>
            </form>
          </li>
        ))}
      </ul>
      <form action={saveKbAction} className="card mt-4 grid gap-2 p-4 sm:grid-cols-[80px_1fr]">
        <select name="locale" className="field" aria-label="Language">{["en", "fr", "ar"].map((l) => <option key={l}>{l}</option>)}</select>
        <input name="question" className="field" placeholder="New question" required aria-label="Question" />
        <span />
        <textarea name="answer" className="field" placeholder="Answer" required aria-label="Answer" />
        <span />
        <div className="flex gap-2"><input name="keywords" className="field flex-1" placeholder="keywords" aria-label="Keywords" /><button className="btn btn-navy">Add</button></div>
      </form>

      <h2 className="mt-8 mb-2 text-lg font-extrabold">Customer reviews (verified bookings only)</h2>
      {revs.length === 0 && <p className="card p-4 text-sm text-noor-muted">No reviews yet.</p>}
      <ul className="space-y-2">
        {revs.map(({ r, name }) => (
          <li key={r.id} className="card flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
            <span><b>{name}</b> · {r.rating}/5 · {dt(r.createdAt)} · {r.status}<br />{r.comment}</span>
            <span className="flex gap-2">
              {(["published", "rejected"] as const).map((s) => (
                <form key={s} action={moderateReviewAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value={s} /><button className="btn btn-outline px-3 py-1 text-xs">{s}</button></form>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
