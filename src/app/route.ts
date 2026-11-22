import { NextResponse, type NextRequest } from "next/server";
import { negotiateLocale } from "@/lib/i18n/config";

/** "/" sends visitors to their language (Accept-Language), English by default. */
export function GET(req: NextRequest) {
  const locale = negotiateLocale(req.headers.get("accept-language"));
  return NextResponse.redirect(new URL(`/${locale}`, req.url), 307);
}
