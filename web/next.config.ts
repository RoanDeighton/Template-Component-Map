import type { NextConfig } from "next";
import path from "node:path";

// Set by the GitHub Pages workflow to "/<repo-name>" — this is a GitHub
// Pages *project* site, served from a subpath rather than the domain root,
// so every internal link/asset needs that prefix baked in at build time.
// Empty locally, so `npm run dev`/`next build` still work unprefixed.
const basePath = process.env.NEXT_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Static HTML export: this app has no API routes, server actions, or
  // per-request data — every route is already enumerable at build time via
  // generateStaticParams, reading output/<site>/content straight off disk.
  // That makes it a plain static site, deployable to GitHub Pages exactly
  // like the VitePress site it replaces.
  output: "export",
  // GitHub Pages has no server-side rewrite, so "/components" needs to be
  // an actual components/index.html file on disk, not components.html.
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  // This app has its own package-lock.json, but the outer repo (the
  // crawler/analyzer pipeline this app reads output/ from) has one too —
  // without this, Turbopack picks the outer one as the workspace root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
