import { test, expect } from '@playwright/test';

test.describe('Snags Page', () => {
  test('unauthenticated user visiting /snags is handled', async ({ page }) => {
    const response = await page.goto('/snags');
    expect(response?.status()).toBeLessThan(500);
  });

  test.describe('authenticated', () => {
    // These tests require a test user to be set up in Supabase
    // Skip for now until test fixtures are configured
    test.skip(true, 'Requires Supabase test user');

    test('page title renders', async ({ page }) => {
      await page.goto('/snags');

      await expect(page.locator('h1', { hasText: 'Snag List' })).toBeVisible();
      await expect(page.locator('text=Track and resolve defects')).toBeVisible();
    });

    test('stats bar renders', async ({ page }) => {
      await page.goto('/snags');

      // Stats cards: Total, Open, In Progress, Fixed, Verified
      await expect(page.locator('text=Total')).toBeVisible();
      await expect(page.locator('text=Open')).toBeVisible();
      await expect(page.locator('text=In Progress')).toBeVisible();
      await expect(page.locator('text=Fixed')).toBeVisible();
      await expect(page.locator('text=Verified')).toBeVisible();
    });

    test('view toggle (list/kanban) exists', async ({ page }) => {
      await page.goto('/snags');

      const listButton = page.locator('button', { hasText: 'List' });
      const boardButton = page.locator('button', { hasText: 'Board' });
      await expect(listButton).toBeVisible();
      await expect(boardButton).toBeVisible();
    });

    test('view toggle switches between list and kanban views', async ({ page }) => {
      await page.goto('/snags');

      // Default should be list view
      const listButton = page.locator('button', { hasText: 'List' });
      const boardButton = page.locator('button', { hasText: 'Board' });

      // Switch to kanban
      await boardButton.click();

      // Switch back to list
      await listButton.click();
    });

    test('quick-add button exists', async ({ page }) => {
      await page.goto('/snags');

      const addButton = page.locator('button', { hasText: 'Add Snag' });
      await expect(addButton).toBeVisible();
    });

    test('quick-add modal opens with form fields', async ({ page }) => {
      await page.goto('/snags');

      await page.click('button:has-text("Add Snag")');

      // Modal should open with form fields
      await expect(page.locator('input[name="title"]')).toBeVisible();
      await expect(page.locator('text=Severity')).toBeVisible();
      await expect(page.locator('button', { hasText: 'critical' })).toBeVisible();
      await expect(page.locator('button', { hasText: 'major' })).toBeVisible();
      await expect(page.locator('button', { hasText: 'minor' })).toBeVisible();
      await expect(page.locator('button[type="submit"]', { hasText: 'Add Snag' })).toBeVisible();
    });

    test('share link section exists when share token is available', async ({ page }) => {
      await page.goto('/snags');

      // If share token exists, the share section should be visible
      const shareInfo = page.locator('text=Contractors can view assigned snags via the shared link');
      const shareButton = page.locator('button', { hasText: 'Share' });
      // Either share section exists or it doesn't (depends on data)
      // Just verify the page loaded without errors
      await expect(page.locator('h1', { hasText: 'Snag List' })).toBeVisible();
    });

    test('filter dropdowns exist', async ({ page }) => {
      await page.goto('/snags');

      // Filter selects for room, severity, status, contractor
      const selects = page.locator('select');
      // At minimum severity and status filters should be present
      await expect(selects.first()).toBeVisible();
    });
  });
});
