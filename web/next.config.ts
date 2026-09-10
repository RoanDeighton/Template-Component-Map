import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // This app has its own package-lock.json, but the outer repo (the
  // crawler/analyzer pipeline this app reads output/ from) has one too —
  // without this, Turbopack picks the outer one as the workspace root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
