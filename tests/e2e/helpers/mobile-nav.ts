import type { Page } from "@playwright/test";

/** Desktop nav is `hidden md:flex`; on mobile viewport open the hamburger first. */
export async function openMobileMenuIfNeeded(page: Page, isMobile: boolean) {
  if (!isMobile) return;
  const openMenu = page.getByRole("button", { name: "Open menu" });
  await openMenu.click();
}
