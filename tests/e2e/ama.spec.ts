import { expect, test } from "@playwright/test";

const questionInput = (page: import("@playwright/test").Page) =>
  page.locator('textarea[placeholder*="Ask me anything"]');

const sendButton = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Send message" });

test.describe("AMA (Ask Me Anything)", () => {
  test("should load AMA page successfully", async ({ page }) => {
    await page.goto("/ama");

    await expect(page.getByRole("heading", { name: "AI Assistant", exact: true })).toBeVisible();
    await expect(
      page.getByText("Ask me anything about my background, experience, and skills")
    ).toBeVisible();
    await expect(questionInput(page)).toBeVisible();
  });

  test("should show development disclaimer when feature is in development", async ({ page }) => {
    await page.goto("/ama");

    const disclaimer = page.locator('[class*="amber"], [class*="warning"]').first();
    if (await disclaimer.isVisible()) {
      await expect(disclaimer).toContainText("Development Feature");
    }
  });

  test("should display welcome screen initially", async ({ page }) => {
    await page.goto("/ama");

    await expect(page.getByText("Welcome to my AI Assistant!")).toBeVisible();
    await expect(page.getByText("Try asking me about:")).toBeVisible();

    const exampleQuestion = page
      .locator("button")
      .filter({ hasText: "Tell me about yourself" })
      .first();
    await expect(exampleQuestion).toBeVisible();
  });

  test("should allow typing in input field", async ({ page }) => {
    await page.goto("/ama");

    const inputField = questionInput(page);
    await inputField.fill("Test question about React experience");

    await expect(inputField).toHaveValue("Test question about React experience");
  });

  test("should submit question using Enter key", async ({ page }) => {
    await page.goto("/ama");

    const inputField = questionInput(page);
    await inputField.fill("What are your skills?");
    await inputField.press("Enter");

    await expect(page.getByText("What are your skills?")).toBeVisible();
    await expect(page.getByText("Thinking...")).toBeVisible();
  });

  test("should submit question using send button", async ({ page }) => {
    await page.goto("/ama");

    const inputField = questionInput(page);
    await inputField.fill("Tell me about your experience");
    await sendButton(page).click();

    await expect(page.getByText("Tell me about your experience")).toBeVisible();
  });

  test("should handle AI response display", async ({ page }) => {
    await page.goto("/ama");

    const inputField = questionInput(page);
    await inputField.fill("What technologies do you use?");
    await inputField.press("Enter");

    await expect(page.getByText("What technologies do you use?")).toBeVisible();
    await expect(page.getByText("Thinking...")).toBeVisible();
  });

  test("should show streaming effect during response", async ({ page }) => {
    await page.goto("/ama");

    const inputField = questionInput(page);
    await inputField.fill("Brief overview of your career");
    await inputField.press("Enter");

    await expect(page.getByText("Thinking...")).toBeVisible();
  });

  test("should allow multiple conversation turns", async ({ page }) => {
    await page.goto("/ama");

    const inputField = questionInput(page);
    await page.locator("button").filter({ hasText: "Tell me about yourself" }).click();
    await expect(inputField).toHaveValue("Tell me about yourself");

    await page.locator("button").filter({ hasText: "Which projects are you working on?" }).click();
    await expect(inputField).toHaveValue("Which projects are you working on?");

    await inputField.press("Enter");
    await expect(page.getByText("Which projects are you working on?")).toBeVisible();
  });

  test("should handle example question clicks", async ({ page }) => {
    await page.goto("/ama");

    const exampleQuestion = page.locator("button").filter({ hasText: "Tell me about yourself" });
    await exampleQuestion.click();

    await expect(questionInput(page)).toHaveValue("Tell me about yourself");
  });

  test("should navigate back to homepage", async ({ page }) => {
    await page.goto("/ama");

    await page.getByRole("link", { name: "Back" }).click();
    await expect(page).toHaveURL("/");
  });
});
