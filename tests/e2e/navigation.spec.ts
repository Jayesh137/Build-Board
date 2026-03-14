import { test, expect } from '@playwright/test';

test.describe('App Shell Navigation', () => {
  test.describe('authenticated', () => {
    // These tests require a test user to be set up in Supabase
    // Skip for now until test fixtures are configured
    test.skip(true, 'Requires Supabase test user');

    test('sidebar renders with all navigation groups', async ({ page }) => {
      await page.goto('/');

      const sidebar = page.locator('aside');
      await expect(sidebar).toBeVisible();

      // Check all nav group labels
      const groups = ['Overview', 'Build', 'Money', 'Compliance', 'Manage', 'Site', 'Files'];
      for (const group of groups) {
        await expect(sidebar.locator(`text=${group}`)).toBeVisible();
      }
    });

    test('all nav links exist with correct hrefs', async ({ page }) => {
      await page.goto('/');

      const expectedLinks = [
        { href: '/', label: 'Dashboard' },
        { href: '/timeline', label: 'Timeline' },
        { href: '/inspections', label: 'Inspections' },
        { href: '/budget', label: 'Budget' },
        { href: '/vat', label: 'VAT Reclaim' },
        { href: '/planning', label: 'Planning & CIL' },
        { href: '/decisions', label: 'Decisions' },
        { href: '/contacts', label: 'Contacts' },
        { href: '/diary', label: 'Diary' },
        { href: '/photos', label: 'Photos' },
        { href: '/snags', label: 'Snags' },
        { href: '/documents', label: 'Documents' },
      ];

      const nav = page.locator('nav');
      for (const link of expectedLinks) {
        const anchor = nav.locator(`a[href="${link.href}"]`);
        await expect(anchor).toBeVisible();
        await expect(anchor).toContainText(link.label);
      }
    });

    test('sidebar has settings and logout in footer', async ({ page }) => {
      await page.goto('/');

      const sidebar = page.locator('aside');
      await expect(sidebar.locator('a[href="/settings"]')).toBeVisible();
      await expect(sidebar.locator('button', { hasText: 'Log out' })).toBeVisible();
    });

    test('mobile menu toggle works', async ({ page }) => {
      // Use mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');

      // Sidebar should be hidden by default on mobile
      const sidebar = page.locator('aside');
      await expect(sidebar).toHaveClass(/-translate-x-full/);

      // Open menu button should be visible
      const menuButton = page.locator('button[aria-label="Open menu"]');
      await expect(menuButton).toBeVisible();

      // Click to open
      await menuButton.click();

      // Sidebar should now be visible
      await expect(sidebar).toHaveClass(/translate-x-0/);

      // Close button should be visible
      const closeButton = page.locator('button[aria-label="Close sidebar"]');
      await expect(closeButton.first()).toBeVisible();
    });

    test('dashboard renders with expected sections', async ({ page }) => {
      await page.goto('/');

      // Phase progress section
      await expect(page.locator('text=Your Build Dashboard').or(page.locator('text=Current Phase'))).toBeVisible();

      // Main sections
      await expect(page.locator('h2', { hasText: 'Next Milestones' })).toBeVisible();
      await expect(page.locator('h2', { hasText: 'This Week' })).toBeVisible();
      await expect(page.locator('h2', { hasText: 'Budget' })).toBeVisible();
      await expect(page.locator('h2', { hasText: 'VAT Reclaimable' })).toBeVisible();
      await expect(page.locator('h2', { hasText: 'Alerts' })).toBeVisible();

      // Bottom quick stats
      await expect(page.locator('text=Open Snags')).toBeVisible();
      await expect(page.locator('text=Pending Decisions')).toBeVisible();
      await expect(page.locator('text=Undischarged Conditions')).toBeVisible();
    });
  });
});
