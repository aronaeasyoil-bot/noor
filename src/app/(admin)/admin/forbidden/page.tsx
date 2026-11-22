import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";

export default async function Forbidden() {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto max-w-md p-10 text-center">
      <h1 className="text-2xl font-extrabold">Access denied</h1>
      <p className="mt-2 text-noor-muted">You do not have access to this page.</p>
      <Link href={user ? "/en" : "/en/account/sign-in?next=/admin"} className="btn btn-primary mt-6">{user ? "Back to the site" : "Sign in"}</Link>
    </div>
  );
}
