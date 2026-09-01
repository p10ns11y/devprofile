import { expect, test } from "@playwright/test";

test.describe("Profile Q&A (/qa)", () => {
  test("loads QA surface and suggested questions", async ({ page }) => {
    await page.goto("/qa");

    await expect(page.getByRole("heading", { name: "Ask me about my work", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Suggestions" })).toBeVisible();
    await expect(page.getByRole("button", { name: /premflow/i }).first()).toBeVisible();
  });

  test("submits a question and shows an answer", async ({ page }) => {
    await page.goto("/qa");

    await page.getByRole("button", { name: /premflow/i }).first().click();

    await expect(page.getByRole("heading", { name: "Answer" })).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("Evidence")).toBeVisible();
  });
});
