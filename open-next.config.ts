import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default OpenNext configuration: no incremental cache is needed (every page is rendered on demand).
export default defineCloudflareConfig();
