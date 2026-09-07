import robotsParser, { Robot } from "robots-parser";

export interface RobotsInfo {
  robot: Robot | null;
  sitemaps: string[];
}

export async function loadRobots(origin: string, userAgent: string): Promise<RobotsInfo> {
  const robotsUrl = new URL("/robots.txt", origin).toString();
  try {
    const res = await fetch(robotsUrl, { headers: { "User-Agent": userAgent } });
    if (!res.ok) return { robot: null, sitemaps: [] };
    const body = await res.text();
    const robot = robotsParser(robotsUrl, body);
    const sitemaps = robot.getSitemaps();
    return { robot, sitemaps };
  } catch {
    return { robot: null, sitemaps: [] };
  }
}

export function isAllowed(info: RobotsInfo, url: string, userAgent: string): boolean {
  if (!info.robot) return true;
  const allowed = info.robot.isAllowed(url, userAgent);
  return allowed !== false;
}
