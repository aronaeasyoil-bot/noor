import { requirePermission } from "@/lib/auth/session";
import { photos, unsplashPage } from "@/lib/media";
import { AdminShell } from "@/components/admin/AdminShell";
import { SafeImage } from "@/components/ui/SafeImage";

export const metadata = { title: "Media library" };

export default async function AdminMedia() {
  const user = await requirePermission("content");
  return (
    <AdminShell user={user} title="Media library">
      <p className="mb-4 text-sm text-noor-muted">{Object.keys(photos).length} licensed photos (Unsplash License). Each key is used for one subject only. To change a photo, edit src/lib/media.ts.</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {Object.entries(photos).map(([k, p]) => (
          <li key={k} className="card overflow-hidden">
            <div className="relative aspect-[4/3]"><SafeImage src={p.src} alt={p.alt} fill sizes="200px" className="object-cover" /></div>
            <div className="p-2 text-xs">
              <p className="font-bold">{k}</p>
              <a className="text-noor-blue underline" href={unsplashPage(p)} target="_blank" rel="noopener noreferrer">{p.credit ?? "Unsplash"}</a>
            </div>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
