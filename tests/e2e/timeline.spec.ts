import { test, expect } from '@playwright/test';

test.describe('Timeline Page', () => {
  test('unauthenticated user visiting /timeline is handled', async ({ page }) => {
    const response = await page.goto('/timeline');
    // Should either redirect to login or show the page without data
    expect(response?.status()).toBeLessThan(500);
  });

  test.describe('authenticated', () => {
    // These tests require a test user to be set up in Supabase
    // Skip for now until test fixtures are configured
    test.skip(true, 'Requires Supabase test user');

    test('page title renders', async ({ page }) => {
      await page.goto('/timeline');

      await expect(page.locator('h1', { hasText: 'Timeline' })).toBeVisible();
      // Task count summary
      await expect(page.locator('text=/\\d+ of \\d+ tasks complete/')).toBeVisible();
    });

    test('add task button exists', async ({ page }) => {
      await page.goto('/timeline');

      const addButton = page.locator('button', { hasText: 'Add Task' });
      await expect(addButton).toBeVisible();
    });

    test('filter controls exist', async ({ page }) => {
      await page.goto('/timeline');

      // Search input
      const searchInput = page.locator('input[placeholder="Search tasks..."]');
      await expect(searchInput).toBeVisible();

      // Phase filter dropdown
      const phaseFilter = page.locator('select').first();
      await expect(phaseFilter).toBeVisible();

      // Status filter dropdown
      const statusFilter = page.locator('select').nth(1);
      await expect(statusFilter).toBeVisible();
    });

    test('phase sections are visible when data exists', async ({ page }) => {
      await page.goto('/timeline');

      // Either phases with tasks are shown, or the empty state
      const phaseHeader = page.locator('button', { hasText: /Phase/ });
      const emptyState = page.locator('text=No phases found');
      await expect(phaseHeader.first().or(emptyState)).toBeVisible();
    });

    test('add task modal opens on button click', async ({ page }) => {
      await page.goto('/timeline');

      await page.click('button:has-text("Add Task")');

      // Modal should appear with form fields
      await expect(page.locator('text=Add Task').last()).toBeVisible();
      await expect(page.locator('input[name="title"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]', { hasText: 'Create Task' })).toBeVisible();
    });
  });
});
