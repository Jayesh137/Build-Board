import { test, expect } from '@playwright/test';

test.describe('VAT Reclaim Page', () => {
  test('unauthenticated user visiting /vat is handled', async ({ page }) => {
    const response = await page.goto('/vat');
    expect(response?.status()).toBeLessThan(500);
  });

  test.describe('authenticated', () => {
    // These tests require a test user to be set up in Supabase
    // Skip for now until test fixtures are configured
    test.skip(true, 'Requires Supabase test user');

    test('page title renders', async ({ page }) => {
      await page.goto('/vat');

      await expect(page.locator('h1', { hasText: 'VAT Reclaim' })).toBeVisible();
      await expect(page.locator('text=Track VAT on materials for your self-build reclaim')).toBeVisible();
    });

    test('reclaimable total displays', async ({ page }) => {
      await page.goto('/vat');

      await expect(page.locator('text=Total Reclaimable')).toBeVisible();
    });

    test('deadline countdown renders', async ({ page }) => {
      await page.goto('/vat');

      await expect(page.locator('text=Deadline')).toBeVisible();
      // Either shows days left/overdue or placeholder
      const deadlineValue = page.locator('text=/days left|days overdue|--/');
      await expect(deadlineValue).toBeVisible();
    });

    test('status counts section renders', async ({ page }) => {
      await page.goto('/vat');

      await expect(page.locator('text=By Status')).toBeVisible();
    });

    test('export button exists', async ({ page }) => {
      await page.goto('/vat');

      const exportButton = page.locator('button', { hasText: 'Export' });
      await expect(exportButton).toBeVisible();
    });

    test('new entry link exists', async ({ page }) => {
      await page.goto('/vat');

      const newEntryLink = page.locator('a[href="/vat/new"]');
      await expect(newEntryLink).toBeVisible();
    });

    test('new entry form has required fields', async ({ page }) => {
      await page.goto('/vat/new');

      await expect(page.locator('h1', { hasText: 'New VAT Entry' })).toBeVisible();

      // Back link
      await expect(page.locator('a[href="/vat"]', { hasText: 'Back to VAT Reclaim' })).toBeVisible();

      // Required form fields: supplier, description, amounts, source
      await expect(page.locator('input[name="supplierName"]')).toBeVisible();
      await expect(page.locator('input[name="description"]')).toBeVisible();
      await expect(page.locator('input[name="netAmount"]')).toBeVisible();
      await expect(page.locator('input[name="vatAmount"]')).toBeVisible();
      await expect(page.locator('input[name="invoiceDate"]')).toBeVisible();
      await expect(page.locator('select[name="source"], [name="source"]').first()).toBeVisible();

      // Invoice total display
      await expect(page.locator('text=Invoice Total')).toBeVisible();

      // Submit button
      await expect(page.locator('button[type="submit"]', { hasText: 'Submit Entry' })).toBeVisible();
    });
  });
});
