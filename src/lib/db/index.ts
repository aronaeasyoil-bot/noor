import "server-only";
import { cache } from "react";
import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

async function connectionString(): Promise<string | null> {
  // On Cloudflare Workers the connection goes through Hyperdrive (pooled, close to the database).
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const hyperdrive = (ctx.env as { HYPERDRIVE?: { connectionString: string } }).HYPERDRIVE;
    if (hyperdrive?.connectionString) return hyperdrive.connectionString;
  } catch {
    // Not running on Cloudflare (local Node.js, tests).
  }
  return process.env.DATABASE_URL ?? null;
}

let nodeClient: Database | null = null;

/**
 * Returns a Drizzle client, or null when no database is configured.
 * On Workers a client is created per request (sockets cannot be shared between requests);
 * on Node.js a single pooled client is reused.
 */
export const getDb = cache(async (): Promise<Database | null> => {
  const url = await connectionString();
  if (!url) return null;
  const onWorkers = typeof (globalThis as { WebSocketPair?: unknown }).WebSocketPair !== "undefined";
  if (!onWorkers) {
    if (!nodeClient) nodeClient = drizzle(postgres(url, { max: 10, prepare: false }), { schema });
    return nodeClient;
  }
  return drizzle(postgres(url, { max: 5, fetch_types: false, prepare: false }), { schema });
});

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("Database is not configured");
  }
}

export async function requireDb(): Promise<Database> {
  const db = await getDb();
  if (!db) throw new DatabaseUnavailableError();
  return db;
}

export { schema };
