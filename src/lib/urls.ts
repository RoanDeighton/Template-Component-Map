import { isAllowed, RobotsInfo } from "./robots.js";

export function normalizeUrl(raw: string, base: string): string | null {
  try {
    const u = new URL(raw, base);
    u.hash = "";
    if (!["http:", "https:"].includes(u.protocol)) return null;
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  } catch {
    return null;
  }
}

export function isSameSite(url: string, rootHost: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === rootHost.replace(/^www\./, "");
  } catch {
    return false;
  }
}

export function pathSegments(url: string): string[] {
  const { pathname } = new URL(url);
  return pathname.split("/").filter(Boolean);
}

const NON_CONTENT_EXTENSIONS = new Set([
  "pdf", "jpg", "jpeg", "png", "gif", "svg", "webp", "avif", "css", "js",
  "json", "xml", "zip", "mp4", "mp3", "woff", "woff2", "ttf", "ico", "csv",
]);

export function looksLikeAsset(url: string): boolean {
  const { pathname } = new URL(url);
  const ext = pathname.split(".").pop()?.toLowerCase();
  return !!ext && NON_CONTENT_EXTENSIONS.has(ext);
}

export function slugFromUrl(url: string): string {
  const { pathname } = new URL(url);
  const slug = pathname.replace(/^\/|\/$/g, "").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  return slug || "home";
}

export interface FilterContext {
  rootHost: string;
  robots: RobotsInfo;
  userAgent: string;
  localePrefix: string | null;
}

// The single normalize -> same-site -> not-an-asset -> robots-allowed ->
// locale-match chain used everywhere a discovered URL needs validating
// (nav/footer discovery, listing detection, and the legacy sitemap+BFS
// path) — one implementation so a fix here (like the locale check missing
// from the legacy BFS loop, once) can't happen again by only being applied
// in one of several copies.
export function filterCandidateUrl(raw: string, baseUrl: string, ctx: FilterContext): string | null {
  const normalized = normalizeUrl(raw, baseUrl);
  if (!normalized) return null;
  if (!isSameSite(normalized, ctx.rootHost)) return null;
  if (looksLikeAsset(normalized)) return null;
  if (!isAllowed(ctx.robots, normalized, ctx.userAgent)) return null;
  if (ctx.localePrefix) {
    const first = new URL(normalized).pathname.split("/").filter(Boolean)[0];
    if (first && /^[a-z]{2}(-[a-z]{2})?$/i.test(first) && first.toLowerCase() !== ctx.localePrefix) return null;
  }
  return normalized;
}
