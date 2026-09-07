import { XMLParser } from "fast-xml-parser";

async function fetchText(url: string, userAgent: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": userAgent } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function fetchSitemapUrls(sitemapUrl: string, userAgent: string, seen = new Set<string>()): Promise<string[]> {
  if (seen.has(sitemapUrl)) return [];
  seen.add(sitemapUrl);

  const xml = await fetchText(sitemapUrl, userAgent);
  if (!xml) return [];

  const parser = new XMLParser({ ignoreAttributes: false });
  let parsed: any;
  try {
    parsed = parser.parse(xml);
  } catch {
    return [];
  }

  const urls: string[] = [];

  if (parsed.sitemapindex) {
    const sitemaps = asArray(parsed.sitemapindex.sitemap);
    for (const sm of sitemaps) {
      const loc = sm?.loc;
      if (typeof loc === "string") {
        urls.push(...(await fetchSitemapUrls(loc, userAgent, seen)));
      }
    }
  }

  if (parsed.urlset) {
    const entries = asArray(parsed.urlset.url);
    for (const entry of entries) {
      const loc = entry?.loc;
      if (typeof loc === "string") urls.push(loc);
    }
  }

  return urls;
}
