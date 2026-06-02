import type { Page } from "@playwright/test";

/** Desktop nav is `hidden lg:flex`; on mobile/tablet viewports open the hamburger first. */
export async function openMobileMenuIfNeeded(page: Page, isMobile: boolean) {
  if (!isMobile) return;
  const openMenu = page.getByRole("button", { name: "Open menu" });
  await openMenu.click();
}
