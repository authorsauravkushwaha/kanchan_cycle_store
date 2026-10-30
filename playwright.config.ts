import { defineConfig } from '@playwright/test';
import { browserLaunchOptions } from './tests/browser';

/**
 * Two modes:
 *  - default: runs the app against the Vite dev server (fast, no service worker)
 *  - PWA_TEST=1: runs against `vite preview` so the production service worker,
 *    manifest and offline cache can be exercised for real.
 */
const pwa = process.env.PWA_TEST === '1';
export default defineConfig({
  testDir: pwa ? './tests/pwa' : './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 7000 },
  reporter: [['list']],
  use: {
    baseURL: pwa ? 'http://127.0.0.1:4173' : 'http://127.0.0.1:5173',
    viewport: { width: 1440, height: 1000 },
    launchOptions: await browserLaunchOptions(),
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: pwa
    ? { command: 'npm run preview', url: 'http://127.0.0.1:4173', reuseExistingServer: true, timeout: 30000 }
    : { command: 'npm run dev', url: 'http://127.0.0.1:5173', reuseExistingServer: true, timeout: 30000 },
});
