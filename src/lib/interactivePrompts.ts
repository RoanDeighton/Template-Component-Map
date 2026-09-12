import { input, select } from "@inquirer/prompts";
import type { NavDiscoveryResult } from "./navDiscovery.js";
import type { GroupedUrls } from "./patternGroup.js";
import type { CaptureCandidate } from "./captureList.js";

export async function promptForUrl(): Promise<string> {
  return input({
    message: "Which site do you want to crawl? (URL)",
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return "Enter a valid URL, e.g. https://example.com";
      }
    },
  });
}

export async function promptForOnlyUrls(): Promise<string[] | null> {
  const raw = await input({
    message: "Do you want specific pages? (comma-separated URLs, or leave blank to auto-discover)",
  });
  const urls = raw.split(",").map((u) => u.trim()).filter(Boolean);
  return urls.length > 0 ? urls : null;
}

// `detected` is whatever detectLocalePrefix() guessed from the URL's first
// path segment (e.g. "nl" from /nl/bezoek), offered as the default so most
// sites just need an enter key-press rather than retyping a code.
export async function promptForLocalePrefix(detected: string | null): Promise<string | null> {
  const suggestion = detected ?? "none";
  const raw = await input({
    message: `Restrict crawl to one language/locale? (path segment like "en" or "nl" — press enter for "${suggestion}", or type "none" to crawl every locale)`,
    default: suggestion,
  });
  const trimmed = raw.trim().toLowerCase();
  return trimmed === "" || trimmed === "none" ? null : trimmed;
}

export function printNavDiscoverySummary(result: NavDiscoveryResult): void {
  console.log(`\nNav & footer pages (${result.navFooterPages.length}):`);
  for (const url of result.navFooterPages) console.log(`  - ${url}`);

  if (result.listings.length > 0) {
    console.log(`\nListing pages found (${result.listings.length}):`);
    for (const listing of result.listings) {
      console.log(
        `  - ${listing.pattern} (linked from ${listing.sourceUrls.length} page${listing.sourceUrls.length === 1 ? "" : "s"}): sampling ${listing.sampledUrls.length} of ${listing.allUrls.length}`,
      );
      for (const url of listing.sampledUrls) console.log(`      ${url}`);
    }
  }
  console.log("");
}

export function printGroupedCaptureSummary(groups: GroupedUrls[], captureList: CaptureCandidate[]): void {
  console.log(`\nExpanded search: ${groups.length} distinct path patterns, ${captureList.length} pages selected for capture:`);
  const takenByPattern = new Map<string, number>();
  for (const c of captureList) takenByPattern.set(c.pattern, (takenByPattern.get(c.pattern) ?? 0) + 1);
  for (const g of groups) {
    const taken = takenByPattern.get(g.pattern) ?? 0;
    console.log(`  - ${g.pattern}: capturing ${taken} of ${g.urls.length}`);
  }
  console.log("");
}

export type CheckpointDecision = "proceed" | "expand" | "cancel";

export async function promptCheckpoint(): Promise<CheckpointDecision> {
  return select({
    message: "Proceed with this capture list?",
    choices: [
      { name: "Proceed with capture", value: "proceed" as const },
      { name: "Expand search (run full sitemap + link crawl)", value: "expand" as const },
      { name: "Cancel", value: "cancel" as const },
    ],
  });
}
