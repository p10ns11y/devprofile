import type { Page } from "@playwright/test";

/** Dev-only chrome (Vercel toolbar, Next overlay) must not intercept visitor controls. */
export async function hideEphemeralChrome(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      [data-vercel-toolbar],
      [data-index-toolbar],
      vercel-live-feedback,
      nextjs-portal {
        display: none !important;
      }
    `,
  });
}

/**
 * Full-page screenshots do not scroll, so Motion `whileInView` / IntersectionObserver
 * sections stay opacity 0 and look like a blank middle. Walk them into view once, then
 * return to the top so the capture is still a document screenshot, not a scrolled crop.
 */
export async function revealBelowFoldMotion(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      [data-section] [style*="opacity"] {
        opacity: 1 !important;
        transform: none !important;
      }
    `,
  });
  await page.evaluate(async () => {
    const sections = Array.from(document.querySelectorAll("[data-section]"));
    for (const section of sections) {
      section.scrollIntoView({ block: "center" });
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 50);
      });
    }
    window.scrollTo(0, 0);
  });
}
