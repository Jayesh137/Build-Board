import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test.describe('unauthenticated access', () => {
    test('navigating to / should show login or dashboard depending on session', async ({ page }) => {
      await page.goto('/');
      // Without a session, the layout renders children directly (no sidebar)
      // The root page still loads but with null data, so we check for either
      // the dashboard content or that we can reach the login page
      const loginLink = page.locator('a[href="/auth/login"]');
      const dashboard = page.locator('text=Your Build Dashboard');
      // One of these should be visible depending on auth state
      await expect(loginLink.or(dashboard)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('login page', () => {
    test('should render login page with email and password fields', async ({ page }) => {
      await page.goto('/auth/login');

      // Page heading
      await expect(page.locator('h1', { hasText: 'BuildTracker' })).toBeVisible();
      await expect(page.locator('text=Sign in to manage your build project')).toBeVisible();

      // Email field
      const emailInput = page.locator('input[name="email"]');
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute('type', 'email');
      await expect(emailInput).toHaveAttribute('required', '');

      // Password field
      const passwordInput = page.locator('input[name="password"]');
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await expect(passwordInput).toHaveAttribute('required', '');

      // Submit button
      const submitButton = page.locator('button[type="submit"]', { hasText: 'Sign in' });
      await expect(submitButton).toBeVisible();
    });

    test('should have a link to signup page', async ({ page }) => {
      await page.goto('/auth/login');

      const signupLink = page.locator('a[href="/auth/signup"]');
      await expect(signupLink).toBeVisible();
      await expect(signupLink).toHaveText('Sign up');
    });

    test('should show error on invalid login', async ({ page }) => {
      await page.goto('/auth/login');

      await page.fill('input[name="email"]', 'nonexistent@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // The form should show an error message via form?.error
      const errorMessage = page.locator('.bg-red-50, [class*="bg-red"]');
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('signup page', () => {
    test('should render signup page with form fields', async ({ page }) => {
      await page.goto('/auth/signup');

      // Page heading
      await expect(page.locator('h1', { hasText: 'BuildTracker' })).toBeVisible();
      await expect(page.locator('text=Create your account to start tracking')).toBeVisible();

      // Email field
      const emailInput = page.locator('input[name="email"]');
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute('type', 'email');

      // Password field
      const passwordInput = page.locator('input[name="password"]');
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Submit button
      const submitButton = page.locator('button[type="submit"]', { hasText: 'Create account' });
      await expect(submitButton).toBeVisible();
    });

    test('should link back to login page', async ({ page }) => {
      await page.goto('/auth/signup');

      const loginLink = page.locator('a[href="/auth/login"]');
      await expect(loginLink).toBeVisible();
      await expect(loginLink).toHaveText('Sign in');
    });
  });
});
