import type { ReactNode } from "react";
import { Photo } from "@/components/ui/Photo";

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="container-noor grid min-h-[70dvh] items-center gap-8 py-10 lg:grid-cols-2">
      <div className="card mx-auto w-full max-w-md p-6 sm:p-8">
        <h1 className="mb-5 text-2xl font-extrabold">{title}</h1>
        {children}
      </div>
      <div className="relative hidden aspect-[4/5] overflow-hidden rounded-3xl lg:block">
        <Photo name="dubai" sizes="50vw" />
      </div>
    </div>
  );
}
