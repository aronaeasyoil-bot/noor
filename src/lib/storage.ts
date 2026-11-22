import "server-only";

/**
 * Private document storage. On Cloudflare: the R2 bucket bound as DOCUMENTS (never public).
 * In local development (Node): files under ./storage, outside the public folder.
 */
type R2Like = {
  put(key: string, value: ArrayBuffer, opts?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer>; httpMetadata?: { contentType?: string } } | null>;
};

async function r2(): Promise<R2Like | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const env = getCloudflareContext().env as unknown as { DOCUMENTS?: R2Like };
    return env.DOCUMENTS ?? null;
  } catch {
    return null;
  }
}

const isNode = typeof process !== "undefined" && !!process.versions?.node && !(globalThis as { WebSocketPair?: unknown }).WebSocketPair;

export async function storageConfigured(): Promise<boolean> {
  return (await r2()) !== null || isNode;
}

export async function putPrivate(key: string, data: ArrayBuffer, contentType: string): Promise<void> {
  const bucket = await r2();
  if (bucket) {
    await bucket.put(key, data, { httpMetadata: { contentType } });
    return;
  }
  if (!isNode) throw new Error("No document storage configured");
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const full = path.join(process.cwd(), "storage", key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, Buffer.from(data));
}

export async function getPrivate(key: string): Promise<ArrayBuffer | null> {
  const bucket = await r2();
  if (bucket) {
    const o = await bucket.get(key);
    return o ? await o.arrayBuffer() : null;
  }
  if (!isNode) return null;
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const b = await fs.readFile(path.join(process.cwd(), "storage", key));
    return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
  } catch {
    return null;
  }
}

/** Checks magic bytes so a renamed executable cannot pass as a PDF or image. */
export function sniffType(buf: ArrayBuffer): "application/pdf" | "image/jpeg" | "image/png" | null {
  const b = new Uint8Array(buf.slice(0, 8));
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return "application/pdf";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  return null;
}
