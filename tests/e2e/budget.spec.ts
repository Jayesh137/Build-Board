import { test, expect } from '@playwright/test';

test.describe('Budget Page', () => {
  test('unauthenticated user visiting /budget is handled', async ({ page }) => {
    const response = await page.goto('/budget');
    expect(response?.status()).toBeLessThan(500);
  });

  test.describe('authenticated', () => {
    // These tests require a test user to be set up in Supabase
    // Skip for now until test fixtures are configured
    test.skip(true, 'Requires Supabase test user');

    test('page title and description render', async ({ page }) => {
      await page.goto('/budget');

      await expect(page.locator('h1', { hasText: 'Budget' })).toBeVisible();
      await expect(page.locator('text=Track spending and allocations')).toBeVisible();
    });

    test('overview cards render', async ({ page }) => {
      await page.goto('/budget');

      // All four summary cards should be visible
      await expect(page.locator('text=Total Budget')).toBeVisible();
      await expect(page.locator('text=Spent')).toBeVisible();
      await expect(page.locator('text=Committed')).toBeVisible();
      await expect(page.locator('text=Remaining')).toBeVisible();
    });

    test('category breakdown section exists', async ({ page }) => {
      await page.goto('/budget');

      await expect(page.locator('h2', { hasText: 'Category Breakdown' })).toBeVisible();
      // Either categories or empty state
      const categories = page.locator('text=Category Breakdown');
      const emptyState = page.locator('text=No budget categories yet');
      await expect(categories.or(emptyState)).toBeVisible();
    });

    test('links to entries page', async ({ page }) => {
      await page.goto('/budget');

      const viewEntriesLink = page.locator('a[href="/budget/entries"]');
      await expect(viewEntriesLink).toBeVisible();
    });

    test('new entry form has required fields', async ({ page }) => {
      await page.goto('/budget/entries/new');

      await expect(page.locator('h1', { hasText: 'New Budget Entry' })).toBeVisible();

      // Back link
      await expect(page.locator('a[href="/budget/entries"]', { hasText: 'Back to Entries' })).toBeVisible();

      // Form fields
      await expect(page.locator('select[name="categoryId"], [name="categoryId"]').first()).toBeVisible();
      await expect(page.locator('select[name="type"], [name="type"]').first()).toBeVisible();
      await expect(page.locator('input[name="supplier"]')).toBeVisible();
      await expect(page.locator('input[name="description"]')).toBeVisible();
      await expect(page.locator('input[name="amount"]')).toBeVisible();
      await expect(page.locator('input[name="date"]')).toBeVisible();

      // Submit button
      await expect(page.locator('button[type="submit"]', { hasText: 'Create Entry' })).toBeVisible();
    });
  });
});
