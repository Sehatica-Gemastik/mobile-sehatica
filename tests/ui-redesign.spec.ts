import { expect, test } from '@playwright/test';

test.describe('Mobile UI Redesign Verification (HaloAI Theme)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081/');
    // Wait for the app to load
    await page.waitForSelector('text=Heally', { timeout: 10000 }).catch(() => { });
  });

  test('Dashboard should have the new theme elements', async ({ page }) => {
    // Wait for loading to finish
    await page.waitForSelector('text=Memuat dashboard...', { state: 'hidden', timeout: 15000 }).catch(() => { });

    // 1. Check for Greeting and Dashboard elements using more flexible locators
    // Sometimes emojis are rendered differently or broken into spans
    await expect(page.locator('text=Pengguna').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Insight Heally Hari Ini').first()).toBeVisible();

    // 2. Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/dashboard.png' });
  });

  test('Records tab should display redesigned components', async ({ page }) => {
    // Navigate to Records tab (it might be labeled "Rekam" or have an icon)
    // In Expo Router tab bar, we can try clicking by text
    await page.click('text=Rekam').catch(() => page.click('[href="/records"]'));
    await page.waitForTimeout(1000);

    // Check if empty state or records list is present
    const hasRecords = await page.locator('text=Rekam Medis').first().isVisible();
    expect(hasRecords).toBeTruthy();

    await page.screenshot({ path: 'test-results/records.png' });
  });

  test('Schedule tab should have rounded buttons and new aesthetic', async ({ page }) => {
    await page.click('text=Jadwal').catch(() => page.click('[href="/schedule"]'));
    await page.waitForTimeout(1000);

    // Verify Schedule title and AI Generate button
    await expect(page.locator('text=Jadwal Harian').first()).toBeVisible();
    await expect(page.locator('text=🤖 AI Generate')).toBeVisible();

    await page.screenshot({ path: 'test-results/schedule.png' });
  });

  test('Heally Chat tab should have new chat bubbles and layout', async ({ page }) => {
    await page.click('text=Heally').catch(() => page.click('[href="/heally"]'));
    await page.waitForTimeout(1000);

    // Check Heally AI status
    await expect(page.locator('text=Heally').first()).toBeVisible();
    await expect(page.locator('text=AI Unverified')).toBeVisible();

    // Send a message
    const input = page.locator('input, textarea').last();
    if (await input.isVisible()) {
      await input.fill('Halo Heally!');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000); // wait for send
    }

    await page.screenshot({ path: 'test-results/heally.png' });
  });
});
