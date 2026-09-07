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
