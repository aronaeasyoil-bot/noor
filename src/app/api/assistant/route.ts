import { z } from "zod";
import { answer } from "@/lib/assistant";
import { rateLimit } from "@/lib/rate-limit";

const body = z.object({ locale: z.enum(["en", "fr", "ar"]), message: z.string().trim().min(1).max(500) });

export async function POST(req: Request) {
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`assistant:${ip}`, 30, 10 * 60_000)) return Response.json({ answer: null }, { status: 429 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ answer: null }, { status: 400 });
  const r = await answer(parsed.data.locale, parsed.data.message);
  return Response.json(r);
}
