import { expect, test } from '@playwright/test';

test.describe('Mobile UI — Sehatica theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081/');
    await page.waitForSelector('text=Sehatica', { timeout: 10000 }).catch(() => { });
  });

  test('Dashboard loads with greeting', async ({ page }) => {
    await page.waitForSelector('text=Memuat dashboard...', { state: 'hidden', timeout: 15000 }).catch(() => { });
    await expect(page.locator('text=Pengguna').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/dashboard.png' });
  });

  test('Records tab displays', async ({ page }) => {
    await page.click('text=Rekam').catch(() => page.click('[href="/records"]'));
    await page.waitForTimeout(1000);
    const hasRecords = await page.locator('text=Rekam Medis').first().isVisible();
    expect(hasRecords).toBeTruthy();
    await page.screenshot({ path: 'test-results/records.png' });
  });

  test('Schedule tab displays', async ({ page }) => {
    await page.click('text=Jadwal').catch(() => page.click('[href="/schedule"]'));
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Jadwal Harian').first()).toBeVisible();
    await page.screenshot({ path: 'test-results/schedule.png' });
  });

  test('Doctor tab displays without Heally', async ({ page }) => {
    await page.click('text=Dokter').catch(() => page.click('[href="/doctor"]'));
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Heally').first()).not.toBeVisible();
    await page.screenshot({ path: 'test-results/doctor.png' });
  });
});
