import { expect, test } from '@playwright/test';

/**
 * The shop film on the first screen.
 *
 * These tests protect the promises made to a phone user on a slow connection:
 * it autoplays silently, it never blocks the page, it stops when it cannot be
 * seen, and it never runs inside the reduced-motion setting.
 */
const film = (page: import('@playwright/test').Page) => page.locator('.hero-film video');

test('the shop film autoplays muted, keeps looping, and shows the poster first', async ({ page }) => {
  await page.goto('/');
  const video = film(page);
  await expect(video).toBeVisible();
  await expect(video).toHaveAttribute('poster', /hero-poster\.webp$/);
  /* Muted autoplay is the only kind every browser allows without a gesture. */
  await expect(video).toHaveJSProperty('muted', true);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused), { timeout: 15000 }).toBe(false);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime), { timeout: 15000 }).toBeGreaterThan(0);
  /* The loop attribute is what makes it run continuously rather than once. */
  await expect(video).toHaveJSProperty('loop', true);
  await expect(video).toHaveJSProperty('playsInline', true);
  /* The film must never be wider than the screen it sits on. */
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('a phone gets the small file and the film stops once the hero is scrolled away', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const video = film(page);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentSrc.split('/').pop()), { timeout: 15000 })
    .toBe('hero-640.mp4');
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused), { timeout: 15000 }).toBe(false);
  /* Scrolling is never hijacked: the page moves, and the film gives up its decoder. */
  await page.evaluate(() => window.scrollTo({ top: 2400, behavior: 'instant' }));
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused), { timeout: 10000 }).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused), { timeout: 10000 }).toBe(false);
});

test('the visitor can mute, unmute and pause the film with its own buttons', async ({ page }) => {
  await page.goto('/');
  const video = film(page);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused), { timeout: 15000 }).toBe(false);
  const sound = page.getByRole('button', { name: /film’s sound on|ভিডিওর শব্দ চালু/ });
  await sound.click();
  await expect(video).toHaveJSProperty('muted', false);
  await page.getByRole('button', { name: /Mute the film|ভিডিওর শব্দ বন্ধ/ }).click();
  await expect(video).toHaveJSProperty('muted', true);
  await page.getByRole('button', { name: /Pause the film|ভিডিও থামান/ }).click();
  await expect(video).toHaveJSProperty('paused', true);
  await page.getByRole('button', { name: /Play the film|ভিডিও চালান/ }).click();
  await expect(video).toHaveJSProperty('paused', false);
});

test('the film does not play inside the reduced-motion setting, and the page still works', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  const video = film(page);
  await expect(video).toBeVisible();
  /* The poster is the whole experience here: no autoplaying motion. */
  await page.waitForTimeout(1500);
  await expect(video).toHaveJSProperty('paused', true);
  await expect(page.locator('.hero-actions').getByRole('link').first()).toBeVisible();
});
