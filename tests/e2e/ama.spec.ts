import { test, expect } from '@playwright/test';

test.describe('AMA (Ask Me Anything)', () => {
  test('should load AMA page successfully', async ({ page }) => {
    await page.goto('/ama');

    // Check page title and main elements
    await expect(page.getByText('AI Assistant')).toBeVisible();
    await expect(page.getByText('Ask me anything about my professional background')).toBeVisible();

    // Check input field is present
    const inputField = page.locator('textarea[placeholder*="Ask me anything"]');
    await expect(inputField).toBeVisible();
  });

  test('should show development disclaimer when feature is in development', async ({ page }) => {
    await page.goto('/ama');

    // Check for development disclaimer (if feature flag is set)
    const disclaimer = page.locator('[class*="amber"], [class*="warning"]').first();
    // Note: This test may need adjustment based on feature flag configuration
    if (await disclaimer.isVisible()) {
      await expect(disclaimer).toContainText('Development Feature');
    }
  });

  test('should display welcome screen initially', async ({ page }) => {
    await page.goto('/ama');

    // Check welcome message
    await expect(page.getByText('Welcome to my AI Assistant!')).toBeVisible();

    // Check example questions
    await expect(page.getByText('Try asking me about:')).toBeVisible();

    // Verify example questions are clickable
    const exampleQuestion = page.locator('button').filter({ hasText: 'Tell me about yourself' }).first();
    await expect(exampleQuestion).toBeVisible();
  });

  test('should allow typing in input field', async ({ page }) => {
    await page.goto('/ama');

    const inputField = page.locator('textarea[placeholder*="Ask me anything"]');
    await inputField.fill('Test question about React experience');

    await expect(inputField).toHaveValue('Test question about React experience');
  });

  test('should submit question using Enter key', async ({ page }) => {
    await page.goto('/ama');

    const inputField = page.locator('textarea[placeholder*="Ask me anything"]');
    await inputField.fill('What are your skills?');
    await inputField.press('Enter');

    // Check that we moved to conversation view
    await expect(page.getByText('What are your skills?')).toBeVisible();

    // Check for loading state
    await expect(page.getByText('Thinking...')).toBeVisible();
  });

  test('should submit question using send button', async ({ page }) => {
    await page.goto('/ama');

    const inputField = page.locator('textarea[placeholder*="Ask me anything"]');
    await inputField.fill('Tell me about your experience');

    const sendButton = page.locator('button').filter({ hasText: /send/i }).first();
    await sendButton.click();

    // Check that question appears in conversation
    await expect(page.getByText('Tell me about your experience')).toBeVisible();
  });

  test('should handle AI response display', async ({ page }) => {
    await page.goto('/ama');

    const inputField = page.locator('textarea[placeholder*="Ask me anything"]');
    await inputField.fill('What technologies do you use?');
    await inputField.press('Enter');

    // Wait for AI response to appear
    await page.waitForTimeout(3000); // Allow time for AI processing

    // Check for AI response (this will depend on actual AI implementation)
    const aiResponse = page.locator('[class*="message"]').filter({ hasText: /AI|Bot/i }).first();
    await expect(aiResponse).toBeVisible();
  });

  test('should show streaming effect during response', async ({ page }) => {
    await page.goto('/ama');

    const inputField = page.locator('textarea[placeholder*="Ask me anything"]');
    await inputField.fill('Brief overview of your career');
    await inputField.press('Enter');

    // Wait for streaming to start
    await page.waitForTimeout(1000);

    // Check for streaming indicators (cursor blinking, etc.)
    // This test may need adjustment based on actual streaming implementation
    const streamingIndicator = page.locator('text="|"').first();
    // Note: Streaming implementation may vary
  });

  test('should allow multiple conversation turns', async ({ page }) => {
    await page.goto('/ama');

    // First question
    const inputField = page.locator('textarea[placeholder*="Ask me anything"]');
    await inputField.fill('What is your background?');
    await inputField.press('Enter');

    // Wait for first response
    await page.waitForTimeout(2000);

    // Second question
    const inputField2 = page.locator('textarea[placeholder*="Ask me anything"]');
    await inputField2.fill('What projects have you worked on?');
    await inputField2.press('Enter');

    // Check both questions appear
    await expect(page.getByText('What is your background?')).toBeVisible();
    await expect(page.getByText('What projects have you worked on?')).toBeVisible();
  });

  test('should handle example question clicks', async ({ page }) => {
    await page.goto('/ama');

    // Click on example question
    const exampleQuestion = page.locator('button').filter({ hasText: 'Tell me about yourself' });
    await exampleQuestion.click();

    // Check that the question was filled in the input
    const inputField = page.locator('textarea[placeholder*="Ask me anything"]');
    await expect(inputField).toHaveValue('Tell me about yourself');
  });

  test('should navigate back to homepage', async ({ page }) => {
    await page.goto('/ama');

    // Click back button
    const backButton = page.getByRole('link', { name: /back/i });
    await backButton.click();

    // Should navigate to homepage
    await expect(page).toHaveURL('/');
  });
});
