import { pathSegments } from "./urls.js";

interface TrieNode {
  children: Map<string, TrieNode>;
  urls: string[];
}

function newNode(): TrieNode {
  return { children: new Map(), urls: [] };
}

export interface GroupedUrls {
  pattern: string;
  urls: string[];
}

/**
 * Groups URLs by path-segment structure. A node whose children count meets
 * or exceeds `collapseThreshold` is treated as a repeating template (e.g.
 * /blog/[slug]) and all its descendants collapse into one pattern group.
 * Nodes below that threshold are treated as one-off pages and kept literal.
 */
export function groupUrlsByPattern(urls: string[], collapseThreshold = 5): GroupedUrls[] {
  const root = newNode();

  for (const url of urls) {
    const segments = pathSegments(url);
    let node = root;
    for (const seg of segments) {
      if (!node.children.has(seg)) node.children.set(seg, newNode());
      node = node.children.get(seg)!;
    }
    node.urls.push(url);
  }

  const groups = new Map<string, string[]>();

  function addToGroup(pattern: string, urls: string[]) {
    if (urls.length === 0) return;
    if (!groups.has(pattern)) groups.set(pattern, []);
    groups.get(pattern)!.push(...urls);
  }

  // Only dead-end (leaf) siblings are candidates for collapsing into a
  // repeating pattern (e.g. thousands of /collection/node/[slug] pages).
  // A node with its own children (e.g. a language root like /nl, /en) is
  // always kept literal and recursed into, no matter how many siblings it
  // has, since it represents a distinct structural section, not a repeat.
  function walk(node: TrieNode, prefix: string) {
    if (node.urls.length > 0) {
      addToGroup(prefix || "/", node.urls);
    }

    if (node.children.size === 0) return;

    const leafEntries: [string, TrieNode][] = [];
    const branchingEntries: [string, TrieNode][] = [];
    for (const entry of node.children) {
      if (entry[1].children.size === 0) leafEntries.push(entry);
      else branchingEntries.push(entry);
    }

    if (leafEntries.length >= collapseThreshold) {
      const pattern = `${prefix}/[*]`;
      const acc: string[] = [];
      for (const [, child] of leafEntries) acc.push(...child.urls);
      addToGroup(pattern, acc);
    } else {
      for (const [seg, child] of leafEntries) walk(child, `${prefix}/${seg}`);
    }

    for (const [seg, child] of branchingEntries) walk(child, `${prefix}/${seg}`);
  }

  walk(root, "");

  return Array.from(groups.entries()).map(([pattern, urls]) => ({ pattern, urls }));
}
