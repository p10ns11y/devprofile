import { expect, test } from "@playwright/test";

test.describe("X Search Page", () => {
  test("should load x search page", async ({ page }) => {
    await page.goto("/x");

    await expect(page.getByRole("heading", { name: /Posts on X of @peramanathan/i })).toBeVisible();
    await expect(page.getByText("Browse top posts and live activity on X")).toBeVisible();
    await expect(page.getByText("Recent", { exact: true })).toBeVisible();
  });

  test("should display search interval cards", async ({ page }) => {
    await page.goto("/x");

    const topLinks = page.getByRole("link", { name: /Search top posts from/i });
    const liveLinks = page.getByRole("link", { name: /Search latest posts from/i });
    await expect(topLinks.first()).toBeVisible();
    await expect(liveLinks.first()).toBeVisible();
    expect(await topLinks.count()).toBeGreaterThan(0);
    expect(await topLinks.count()).toBe(await liveLinks.count());
  });

  test("should link cards to x.com search with top and live filters", async ({ page }) => {
    await page.goto("/x");

    const firstTop = page.getByRole("link", { name: /Search top posts from/i }).first();
    const firstLive = page.getByRole("link", { name: /Search latest posts from/i }).first();

    await expect(firstTop).toHaveAttribute("href", /x\.com\/search\?.*f=top/);
    await expect(firstLive).toHaveAttribute("href", /x\.com\/search\?.*f=live/);
    await expect(firstTop).toHaveAttribute("target", "_blank");
    await expect(firstLive).toHaveAttribute("target", "_blank");
  });

  test("should update end date when start date changes", async ({ page }) => {
    await page.goto("/x");

    const customWindow = page.getByRole("region", { name: "8-day window" });
    const startInput = customWindow.getByLabel("Start date");
    // Date inputs on mobile Chromium ignore a bare value setter; React's
    // controlled tracker must see a previous value or onChange never fires.
    await startInput.evaluate((node, iso) => {
      const dateInput = node as HTMLInputElement;
      const previousValue = dateInput.value;
      const valueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      valueSetter?.call(dateInput, iso);
      const valueTracker = (
        dateInput as HTMLInputElement & {
          _valueTracker?: { setValue: (next: string) => void };
        }
      )._valueTracker;
      valueTracker?.setValue(previousValue);
      dateInput.dispatchEvent(new Event("input", { bubbles: true }));
      dateInput.dispatchEvent(new Event("change", { bubbles: true }));
    }, "2025-01-01");

    await expect(customWindow.getByText("2025-01-08")).toBeVisible();
    await expect(customWindow.getByText(/until 2025-01-09/)).toBeVisible();
    await expect(
      customWindow.getByRole("link", { name: /Search top posts from Jan 1 – Jan 8, 2025/i })
    ).toBeVisible();
  });

  test("should have header navigation", async ({ page, isMobile }) => {
    await page.goto("/x");

    const { headerBrandLink, openMobileMenuIfNeeded } = await import("./helpers/mobile-nav");
    await openMobileMenuIfNeeded(page, isMobile);
    await headerBrandLink(page).click();
    await expect(page).toHaveURL("/");
  });

  test("should redirect content hub to x page", async ({ page }) => {
    await page.goto("/content-hub");

    await expect(page).toHaveURL(/\/x$/);
    await expect(page.getByRole("heading", { name: /Posts on X of @peramanathan/i })).toBeVisible();
  });
});
