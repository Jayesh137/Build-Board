import { test, expect } from '@playwright/test';

test.describe('Planning & CIL Page', () => {
  test('unauthenticated user visiting /planning is handled', async ({ page }) => {
    const response = await page.goto('/planning');
    expect(response?.status()).toBeLessThan(500);
  });

  test.describe('authenticated', () => {
    // These tests require a test user to be set up in Supabase
    // Skip for now until test fixtures are configured
    test.skip(true, 'Requires Supabase test user');

    test('page title renders', async ({ page }) => {
      await page.goto('/planning');

      await expect(page.locator('h1', { hasText: 'Planning & CIL' })).toBeVisible();
      await expect(
        page.locator('text=Planning permission, conditions, and CIL self-build exemption')
      ).toBeVisible();
    });

    test('three sections render: planning status, conditions, CIL workflow', async ({ page }) => {
      await page.goto('/planning');

      // Section 1: Planning Permission
      await expect(page.locator('h2', { hasText: 'Planning Permission' })).toBeVisible();

      // Section 2: Planning Conditions
      await expect(page.locator('h2', { hasText: /Planning Conditions/ })).toBeVisible();

      // Section 3: CIL Self-Build Exemption Workflow
      await expect(
        page.locator('h2', { hasText: 'CIL Self-Build Exemption Workflow' })
      ).toBeVisible();
    });

    test('planning status shows data or empty state', async ({ page }) => {
      await page.goto('/planning');

      // Either shows planning reference or empty state
      const reference = page.locator('text=Reference');
      const emptyState = page.locator('text=No planning status configured');
      await expect(reference.or(emptyState)).toBeVisible();
    });

    test('conditions section shows table or empty state', async ({ page }) => {
      await page.goto('/planning');

      const conditionsTable = page.locator('table');
      const emptyState = page.locator('text=No planning conditions added');
      await expect(conditionsTable.first().or(emptyState)).toBeVisible();
    });

    test('CIL steps display or show empty state', async ({ page }) => {
      await page.goto('/planning');

      const cilSteps = page.locator('text=/Form \\d|Form 6|Form 7/');
      const emptyState = page.locator('text=No CIL steps configured');
      await expect(cilSteps.first().or(emptyState)).toBeVisible();
    });

    test('commencement status warning or ready message displays', async ({ page }) => {
      await page.goto('/planning');

      // Either CANNOT COMMENCE warning or Ready to Commence message
      const cannotCommence = page.locator('text=CANNOT COMMENCE');
      const readyToCommence = page.locator('text=Ready to Commence');
      const noCilSteps = page.locator('text=No CIL steps configured');
      await expect(
        cannotCommence.or(readyToCommence).or(noCilSteps)
      ).toBeVisible();
    });

    test('blocking steps show blocking indicator', async ({ page }) => {
      await page.goto('/planning');

      // If there are CIL steps with isBlocking=true, they should show "(blocking)"
      const blockingIndicator = page.locator('text=(blocking)');
      const noCilSteps = page.locator('text=No CIL steps configured');
      // Either blocking indicators exist or there are no CIL steps
      await expect(
        blockingIndicator.first().or(noCilSteps)
      ).toBeVisible();
    });
  });
});
