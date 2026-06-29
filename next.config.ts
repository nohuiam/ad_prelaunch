import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Pin the workspace root to THIS repo so Next ignores any stray package-lock.json
// in a parent directory (e.g. ~/package-lock.json) and doesn't mis-infer the root.
const root = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: { root },
};

export default nextConfig;
