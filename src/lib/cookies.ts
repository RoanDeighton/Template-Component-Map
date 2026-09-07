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

const REJECT_TEXT = /reject all|decline all|reject cookies|decline|only necessary|alleen noodzakelijke|noodzakelijke cookies|weiger|afwijzen/i;
const ACCEPT_TEXT = /accept all|allow all|accept cookies|akkoord|toestaan|accepteren|i agree/i;

export async function dismissCookieBanner(page: Page): Promise<void> {
  try {
    for (const selector of KNOWN_SELECTORS) {
      const el = page.locator(selector).first();
      if (await el.isVisible({ timeout: 800 }).catch(() => false)) {
        await el.click({ timeout: 1500 }).catch(() => {});
        await page.waitForTimeout(300);
        return;
      }
    }

    const rejectButton = page.getByRole("button", { name: REJECT_TEXT }).first();
    if (await rejectButton.isVisible({ timeout: 800 }).catch(() => false)) {
      await rejectButton.click({ timeout: 1500 }).catch(() => {});
      await page.waitForTimeout(300);
      return;
    }

    const acceptButton = page.getByRole("button", { name: ACCEPT_TEXT }).first();
    if (await acceptButton.isVisible({ timeout: 800 }).catch(() => false)) {
      await acceptButton.click({ timeout: 1500 }).catch(() => {});
      await page.waitForTimeout(300);
    }
  } catch {
    // No banner, or it didn't match known patterns — proceed without blocking the capture.
  }
}
