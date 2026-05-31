import { expect, test } from "@playwright/test";

test.describe("Profile Q&A (/qa)", () => {
  // Scenario S1, S2, S3 — visitor submits question and sees answer + retrieved panel
  test("loads QA surface and suggested questions", async ({ page }) => {
    await page.goto("/qa");

    await expect(page.getByRole("heading", { name: "Q&A", level: 1 })).toBeVisible();
    await expect(page.getByText("Suggested questions")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /premflow in C instead of Python/i })
    ).toBeVisible();
  });

  // Scenario S1, S3
  test("submits a question and shows an answer", async ({ page }) => {
    await page.goto("/qa");

    const input = page.getByLabel("Your question");
    await input.fill("What is your email?");
    await page.getByRole("button", { name: "Quest", exact: true }).click();

    await expect(page.getByRole("heading", { name: "Answer" })).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("Retrieved information")).toBeVisible();
  });
});
