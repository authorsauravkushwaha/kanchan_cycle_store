import { expect, test } from '@playwright/test';

const scrollTo = async (page: import('@playwright/test').Page, top: number) => {
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), top);
  await page.waitForTimeout(550);
};
const wheelTurn = (page: import('@playwright/test').Page) => page.locator('.hero-neu').evaluate(element =>
  Number.parseFloat(element.style.getPropertyValue('--wheel-turn') || '0'),
);

test('scrolling down rotates the bicycle and scrolling up reverses the same pose', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.cycle-scene')).toBeVisible();
  await scrollTo(page, 0);
  const start = await wheelTurn(page);
  await scrollTo(page, 450);
  const down = await wheelTurn(page);
  expect(down).toBeGreaterThan(start);
  await expect(page.locator('html')).toHaveAttribute('data-scroll-direction', 'down');
  await scrollTo(page, 0);
  expect(await wheelTurn(page)).toBeCloseTo(start, 1);
  await expect(page.locator('html')).toHaveAttribute('data-scroll-direction', 'up');
  expect(await page.evaluate(() => Number(document.documentElement.style.getPropertyValue('--page-progress')))).toBe(0);
});

test('the bicycle can be rotated and reset without changing shop content', async ({ page }) => {
  await page.goto('/');
  await page.locator('.site-header').getByRole('button', { name: 'EN', exact: true }).click();
  const scene = page.locator('.cycle-scene');
  await expect(scene.locator('.scene-view-label')).toHaveText('Side view');
  await scene.getByRole('button', { name: 'Rotate bicycle view' }).click();
  await expect(scene.locator('.scene-view-label')).toHaveText('Reverse three-quarter view');
  await expect(scene).toHaveAttribute('style', /--view-angle: 24deg/);
  await scene.getByRole('button', { name: 'Reset bicycle view' }).click();
  await expect(scene.locator('.scene-view-label')).toHaveText('Side view');
  await expect(scene.getByRole('button', { name: 'Reset bicycle view' })).toBeDisabled();
  await expect(page.locator('h1')).toContainText('Every Journey Begins With the Right Bicycle.');
});

test('pause stops decorative motion, persists, and resume restores it', async ({ page }) => {
  await page.goto('/');
  await page.locator('.site-header').getByRole('button', { name: 'EN', exact: true }).click();
  await page.getByRole('button', { name: 'Pause animations' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.getByRole('button', { name: 'Resume animations' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Rotate bicycle view' })).toBeDisabled();
  await scrollTo(page, 350);
  await expect(page.locator('.wheel-spokes').first()).toHaveCSS('transform', 'none');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await page.getByRole('button', { name: 'Resume animations' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await expect(page.getByRole('button', { name: 'Rotate bicycle view' })).toBeEnabled();
});

test('the operating system reduced-motion preference is respected without hiding content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('.motion-toggle')).toBeDisabled();
  const card = page.locator('.category-card').first();
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await expect(card).toHaveCSS('transform', 'none');
  await expect(card).toHaveCSS('opacity', '1');
  await expect(card).toBeVisible();
  await expect(page.locator('.wheel-spokes').first()).toHaveCSS('transform', 'none');
});

test('lazy-loaded routes receive scroll reveals and pointer tilt', async ({ page }) => {
  await page.goto('/services');
  await expect(page.locator('h1')).toContainText('সাইকেলের সমস্যার কথা বলুন');
  const card = page.locator('.service-card').first();
  await expect(card).toHaveAttribute('data-tilt', '');
  await expect(card).toHaveClass(/reveal-item/);
  await card.scrollIntoViewIfNeeded();
  await expect(card).toBeVisible();
});

test('mobile visitors can pause motion and keep native touch scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const pause = page.locator('.motion-toggle');
  await expect(pause).toBeVisible();
  await pause.click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await scrollTo(page, 600);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await expect(page.locator('.mobile-action-bar')).toBeVisible();
});
