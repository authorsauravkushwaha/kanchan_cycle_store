import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 360, height: 640 }, userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36' });

test('Android users can find installation instructions without an install prompt', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'মেনু খুলুন' }).click();
  await page.locator('.drawer-install').click();
  const dialog = page.locator('.mobile-drawer .install-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('বিনামূল্যে');
  await expect(dialog).toContainText('Chrome');
  await expect(dialog.getByRole('button', { name: 'অ্যাপ ইনস্টল করুন' })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'পরে' }).click();
  await expect(dialog).not.toBeVisible();
  await page.locator('.drawer-top button').click();
  await expect(page.locator('.mobile-action-bar a')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('an available install prompt can be launched from the menu', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.assign(event, { prompt: async () => { (window as any).installCalled = true; }, userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }) });
    window.dispatchEvent(event);
  });
  await page.getByRole('button', { name: 'মেনু খুলুন' }).click();
  await page.locator('.drawer-install').click();
  await page.locator('.mobile-drawer .install-dialog').getByRole('button', { name: 'অ্যাপ ইনস্টল করুন' }).click();
  expect(await page.evaluate(() => (window as any).installCalled)).toBe(true);
});
