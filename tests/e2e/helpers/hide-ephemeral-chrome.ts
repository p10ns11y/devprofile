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
