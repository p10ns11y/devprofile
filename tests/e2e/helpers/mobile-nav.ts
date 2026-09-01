import type { Page } from "@playwright/test";

/** Desktop nav is `hidden lg:flex`; on mobile/tablet viewports open the hamburger first. */
export async function openMobileMenuIfNeeded(page: Page, isMobile: boolean) {
  if (!isMobile) return;
  const openMenu = page.getByRole("button", { name: "Open menu" });
  await openMenu.click();
  await page.getByRole("navigation", { name: "Mobile" }).waitFor({ state: "visible" });
}

/** Header brand — there is no Home button after the hire-site nav. */
export function headerBrandLink(page: Page) {
  return page.locator("header").getByRole("link", { name: "Peramanathan S." });
}

export function siteNav(page: Page, isMobile: boolean) {
  return page.getByRole("navigation", { name: isMobile ? "Mobile" : "Primary" });
}
