import { test, expect } from '@playwright/test';

/**
 * Production-only PWA checks. Run `npm run build` first, then `npm run test:pwa`.
 * A dev server deliberately has no service worker, so this is the only automated
 * proof that the offline experience works.
 */
test.describe('installed-app behaviour', () => {
  test('manifest and service worker make every route available offline', async ({ page, context }) => {
    await page.goto('/');
    const manifest = await page.evaluate(async () => {
      const response = await fetch('/manifest.webmanifest');
      return { status: response.status, type: response.headers.get('content-type'), body: await response.json() };
    });
    expect(manifest.status).toBe(200);
    expect(manifest.type).toContain('manifest');
    expect(manifest.body.display).toBe('standalone');
    expect(manifest.body.icons.length).toBeGreaterThanOrEqual(4);

    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active && registration.active.state !== 'activated') {
        await new Promise<void>(resolve => registration.active?.addEventListener('statechange', () => {
          if (registration.active?.state === 'activated') resolve();
        }));
      }
    });
    // A worker only controls a page after a navigation, so reload once it is ready.
    if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
      await page.reload();
    }
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 15000 }).toBe(true);

    // A non-app navigation must not replace the cached app shell.
    await page.goto('/offline.html');

    // Every hashed build file is precached, so unvisited tabs open offline too.
    await context.setOffline(true);
    const routes: [string, string][] = [
      ['/services', 'সাইকেলের সমস্যার কথা বলুন'],
      ['/cycles', 'পছন্দের সাইকেল খুঁজুন'],
      ['/recommendation', 'কোন সাইকেলটি আপনার জন্য?'],
      ['/list', 'আমার পছন্দের তালিকা'],
      ['/', 'আপনার যাত্রা শুরু হোক সঠিক সাইকেলে'],
    ];
    for (const [path, heading] of routes) {
      await page.goto(path);
      await expect(page.locator('h1').first()).toContainText(heading);
      await expect(page.locator('.offline-banner')).toBeVisible();
    }

    // Calling and WhatsApp must keep working from the cached page.
    const bar = page.locator('.mobile-action-bar');
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(bar.locator('a').nth(0)).toHaveAttribute('href', /wa\.me\/917076884950/);
    await expect(bar.locator('a').nth(1)).toHaveAttribute('href', 'tel:+917076884950');

    await context.setOffline(false);
    await page.goto('/');
    await expect(page.locator('.offline-banner')).toHaveCount(0);
  });

  test('the offline fallback page is usable without the app', async ({ page }) => {
    await page.goto('/offline.html');
    await expect(page.locator('h1')).toContainText('আপনি এখন অফলাইনে আছেন');
    await expect(page.locator('a[href="tel:+917076884950"]')).toBeVisible();
    await expect(page.locator('a[href*="wa.me/917076884950"]')).toBeVisible();
  });
});
