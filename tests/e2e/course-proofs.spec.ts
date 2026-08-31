import { expect, test } from "@playwright/test";

const cilium = "https://www.credly.com/badges/09e29284-43e8-4ea3-aa62-196d977d34d8";
const chatWithData =
  "https://learn.deeplearning.ai/accomplishments/f72f24f1-9ad2-4bc0-b8c2-33cbecb81ec2";
const langchainJs =
  "https://learn.deeplearning.ai/accomplishments/14907d64-9ff2-4dc7-b5f7-ce42982f8551?usp=sharing";

test.describe("Course proof links", () => {
  test("Academic on the homepage links Cilium and LangChain proofs", async ({ page }) => {
    await page.goto("/");
    const academic = page.locator("#academic");
    await expect(academic.getByRole("heading", { name: "Courses" })).toBeVisible();
    await expect(academic.getByRole("link", { name: "Cilium AI/ML Security" })).toHaveAttribute(
      "href",
      cilium
    );
    await expect(
      academic.getByRole("link", { name: "LangChain Chat with Your Data" })
    ).toHaveAttribute("href", chatWithData);
    await expect(
      academic.getByRole("link", { name: "Build LLM Apps with LangChain.js" })
    ).toHaveAttribute("href", langchainJs);
  });

  test("Earned lists the same courses with proof links", async ({ page }) => {
    await page.goto("/certificates");
    const courses = page.locator('[data-grid="courses"]');
    await expect(page.getByRole("heading", { name: "Courses", exact: true })).toBeVisible();
    await expect(courses.getByRole("link", { name: /Cilium AI\/ML Security/ })).toHaveAttribute(
      "href",
      cilium
    );
    await expect(
      courses.getByRole("link", { name: /LangChain Chat with Your Data/ })
    ).toHaveAttribute("href", chatWithData);
    await expect(
      courses.getByRole("link", { name: /Build LLM Apps with LangChain.js/ })
    ).toHaveAttribute("href", langchainJs);
  });
});
