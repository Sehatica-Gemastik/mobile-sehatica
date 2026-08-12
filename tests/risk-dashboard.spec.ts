import { expect, test } from '@playwright/test';

// Covers the new PRD-A surfaces: Target Kesehatan / risk badge on Beranda,
// and manual create on Smart Schedule. Runs against `expo start --web` on
// :8081 (no playwright.config.ts in this repo — see tests/ui-redesign.spec.ts
// for the same convention). Each test registers its own fresh user so runs
// don't collide with leftover data.

function uniqueEmail() {
  return `pw_${Date.now()}_${Math.floor(Math.random() * 1e6)}@sehatica.test`;
}

async function registerFreshUser(page: import('@playwright/test').Page) {
  await page.goto('http://localhost:8081/(auth)/register', { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('Nama Anda').fill('Playwright Tester');
  await page.getByPlaceholder('nama@email.com').fill(uniqueEmail());
  await page.getByPlaceholder('Min. 6 karakter').fill('password123');
  await page.getByText('Daftar', { exact: true }).click();
  await page.waitForSelector('text=Target Kesehatan', { timeout: 15000 });
}

test.describe('Target Kesehatan & Risk Score (Beranda)', () => {
  test('user baru melihat CTA "Isi data" saat belum ada RiskProfile', async ({ page }) => {
    await registerFreshUser(page);
    await expect(page.getByText('Isi data', { exact: true })).toBeVisible();
    await page.screenshot({ path: 'test-results/risk-dashboard-empty.png' });
  });

  test('isi form data kesehatan -> badge risiko & Target Kesehatan muncul', async ({ page }) => {
    await registerFreshUser(page);

    await page.getByText('Isi data', { exact: true }).click();
    await expect(page.getByText('Update data kesehatan')).toBeVisible();

    await page.getByPlaceholder('120', { exact: true }).fill('150');
    await page.getByPlaceholder('80', { exact: true }).fill('95');
    await page.getByPlaceholder('90', { exact: true }).fill('130');
    await page.getByPlaceholder('165', { exact: true }).fill('165');
    await page.getByPlaceholder('65', { exact: true }).fill('85');
    await page.getByText('Rutin', { exact: true }).click();

    await page.getByText('Simpan', { exact: true }).click();
    await page.waitForTimeout(1500);

    // RiskScore dihitung dari input di atas -> minimal "sedang", biasanya "tinggi"
    const bodyText = await page.locator('body').innerText();
    expect(/Risiko (rendah|sedang|tinggi)/.test(bodyText)).toBeTruthy();

    await page.screenshot({ path: 'test-results/risk-dashboard-filled.png' });
  });
});

test.describe('Smart Schedule — create manual', () => {
  test('tambah item jadwal manual muncul di list dengan badge belum diverifikasi', async ({ page }) => {
    await registerFreshUser(page);

    await page.goto('http://localhost:8081/(tabs)/schedule', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Tambah jadwal').click();
    await expect(page.getByText('Tambah jadwal', { exact: true })).toBeVisible();

    await page.getByPlaceholder('Minum obat tensi').fill('Cek tensi mandiri');
    await page.getByPlaceholder('08:00').fill('19:30');
    await page.getByText('Simpan jadwal', { exact: true }).click();
    await page.waitForTimeout(1500);

    await expect(page.getByText('Cek tensi mandiri')).toBeVisible();
    await expect(page.getByText('Belum diverifikasi').first()).toBeVisible();

    await page.screenshot({ path: 'test-results/schedule-manual-create.png' });
  });
});
