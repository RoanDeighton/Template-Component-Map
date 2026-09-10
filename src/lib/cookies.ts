import { Page } from "playwright";

const KNOWN_SELECTORS = [
  // vendor-specific reject/decline buttons first (privacy-preserving default)
  "#onetrust-reject-all-handler",
  "#CybotCookiebotDialogBodyButtonDecline",
  "#didomi-notice-disagree-button",
  "button[aria-label*='Disagree' i]",
  // vendor-specific accept as fallback, only used if no reject option exists
  "#onetrust-accept-btn-handler",
  "#CybotCookiebotDialogBodyButtonAccept",
  "#didomi-notice-agree-button",
];

// The banner's own container, one per entry in KNOWN_SELECTORS above (same
// index) — screenshot this instead of just the button so the captured
// image shows the whole banner, not a single tiny button.
const KNOWN_CONTAINER_SELECTORS = [
  "#onetrust-banner-sdk",
  "#CybotCookiebotDialog",
  "#didomi-host",
  "#didomi-host",
  "#onetrust-banner-sdk",
  "#CybotCookiebotDialog",
  "#didomi-host",
];

const REJECT_TEXT = /reject all|decline all|reject cookies|decline|only necessary|alleen noodzakelijke|noodzakelijke cookies|weiger|afwijzen|nee[, ]/i;
const ACCEPT_TEXT = /accept all|allow all|accept cookies|akkoord|toestaan|accepteren|i agree/i;

// Walks up from a button to the nearest ancestor that looks like the
// banner's own container (a dialog role, or a handful of common cookie/
// consent class-name conventions) — used when the button was matched by
// its text rather than a known vendor selector, so there's no fixed
// container id to go on.
async function findBannerContainer(page: Page, button: ReturnType<Page["locator"]>) {
  const container = button.locator(
    "xpath=ancestor::*[" +
      "@role='dialog' or @role='alertdialog' or " +
      "contains(translate(@class,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'cookie') or " +
      "contains(translate(@class,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'consent')" +
      "][1]",
  );
  if (await container.count()) return container;
  return null;
}

export interface DismissResult {
  dismissed: boolean;
  screenshotTaken: boolean;
}

// Captures a screenshot of the banner (if `screenshotPath` is given and one
// is found) before dismissing it, then clicks reject (preferred) or accept.
export async function dismissCookieBanner(page: Page, screenshotPath?: string): Promise<DismissResult> {
  const result: DismissResult = { dismissed: false, screenshotTaken: false };
  try {
    for (let i = 0; i < KNOWN_SELECTORS.length; i++) {
      const el = page.locator(KNOWN_SELECTORS[i]).first();
      if (await el.isVisible({ timeout: 800 }).catch(() => false)) {
        if (screenshotPath) {
          const container = page.locator(KNOWN_CONTAINER_SELECTORS[i]).first();
          result.screenshotTaken = await screenshotIfVisible(container, screenshotPath);
        }
        await el.click({ timeout: 1500 }).catch(() => {});
        await page.waitForTimeout(300);
        result.dismissed = true;
        return result;
      }
    }

    const rejectButton = page.getByRole("button", { name: REJECT_TEXT }).first();
    if (await rejectButton.isVisible({ timeout: 800 }).catch(() => false)) {
      if (screenshotPath) {
        const container = await findBannerContainer(page, rejectButton);
        result.screenshotTaken = container ? await screenshotIfVisible(container, screenshotPath) : await screenshotIfVisible(rejectButton, screenshotPath);
      }
      await rejectButton.click({ timeout: 1500 }).catch(() => {});
      await page.waitForTimeout(300);
      result.dismissed = true;
      return result;
    }

    const acceptButton = page.getByRole("button", { name: ACCEPT_TEXT }).first();
    if (await acceptButton.isVisible({ timeout: 800 }).catch(() => false)) {
      if (screenshotPath) {
        const container = await findBannerContainer(page, acceptButton);
        result.screenshotTaken = container ? await screenshotIfVisible(container, screenshotPath) : await screenshotIfVisible(acceptButton, screenshotPath);
      }
      await acceptButton.click({ timeout: 1500 }).catch(() => {});
      await page.waitForTimeout(300);
      result.dismissed = true;
    }
  } catch {
    // No banner, or it didn't match known patterns — proceed without blocking the capture.
  }
  return result;
}

async function screenshotIfVisible(locator: ReturnType<Page["locator"]>, path: string): Promise<boolean> {
  try {
    if (!(await locator.isVisible({ timeout: 500 }))) return false;
    await locator.screenshot({ path });
    return true;
  } catch {
    return false;
  }
}
