import { test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

/**
 * Regression guard for a whole-page blank screen.
 *
 * `PwaProvider` and `MotionExperience` both call `matchMedia` inside mount
 * effects without (previously) checking that it exists. Some embedded Android
 * webviews, in-app browsers and stripped-down environments do not expose it,
 * and a throw inside a mount effect unmounts the tree: the visitor gets a
 * blank page with no error, which looks exactly like "the website is broken".
 *
 * `tests/setup.ts` intentionally does not polyfill `matchMedia`; jsdom omits it,
 * so this file exercises the same path those webviews take. Do not add a
 * global `matchMedia` stub to the setup file - it would hide this bug again.
 */
test('the app renders when window.matchMedia is unavailable', async () => {
  vi.stubGlobal('scrollTo', vi.fn());
  // jsdom may or may not provide matchMedia; make the "missing" case explicit.
  Reflect.deleteProperty(window, 'matchMedia');

  window.history.pushState({}, '', '/');
  render(<App />);

  const heading = await screen.findByRole('heading', { level: 1 }, { timeout: 9000 });
  expect(heading.textContent).toContain('আপনার যাত্রা শুরু হোক সঠিক সাইকেলে');
});
