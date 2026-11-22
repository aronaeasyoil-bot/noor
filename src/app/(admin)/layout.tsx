import type { Metadata } from "next";
import "../globals.css";
import { jakarta } from "@/lib/fonts";

export const metadata: Metadata = { title: { default: "NOOR administration", template: "%s · NOOR admin" }, robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={jakarta.variable}>
      <body className="min-h-dvh bg-noor-bg">{children}</body>
    </html>
  );
}
