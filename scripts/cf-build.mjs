// Cloudflare Workers Builds entry point: applies DB migrations when DATABASE_URL is
// available as a build variable, then builds the Worker with OpenNext.
import { execSync } from "node:child_process";
const run = (cmd) => execSync(cmd, { stdio: "inherit" });
if (process.env.DATABASE_URL) run("node scripts/migrate.mjs");
else console.log("DATABASE_URL not set at build time: skipping migrations");
if (process.env.DATABASE_URL) run("npm run db:seed"); // idempotent; creates the admin only if SEED_ADMIN_* are set
run("npx opennextjs-cloudflare build");
