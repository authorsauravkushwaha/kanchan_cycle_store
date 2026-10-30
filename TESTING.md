# Testing and quality checks

Environment: local development and production-preview builds in the Arena sandbox.
This is **not** a public deployment or a field-data Core Web Vitals report.

## Android/PWA release verification — 2026-10-30

| Check | Result |
|---|---|
| `npm test` | **46 passed** across 8 files (config honesty, catalogue filtering, quiz/repair messages, inventory mapping, shortlist storage/message, stock-desk CSV/JSON, product cards, reversible scroll math and motion preference) |
| `npm run build` | Passed: TypeScript, production build, catalogue validation, PWA artefact checks, SEO files |
| `npm run test:e2e` | **18 passed**: bilingual navigation, routes, catalogue, shortlist flow, repair, quiz, drawer, install sheet, responsive overflow, axe, image policy, reversible scroll, bicycle rotation, pause/persistence, reduced motion, lazy-route enhancement |
| `npm run test:pwa` | **2 passed** against `vite preview`: manifest, service-worker control, every route opened offline, offline fallback page |
| `npm run security:check` | Passed after build: CSP (including `manifest-src`/`worker-src`), no inline scripts, PWA files, secret patterns |
| Offline route sweep | `/`, `/cycles`, `/list`, `/services`, `/recommendation` and the 404 all render from cache with the offline banner; call and WhatsApp links still work |
| Axe WCAG 2 A/AA + 2.1 AA | 0 violations on Home, Cycles, My list, Services, Recommendation and Contact at 1440 px and 390 px; an ad-hoc run on `/owner` and the open install sheet also returned 0 |
| Responsive overflow sweep | No horizontal overflow at 320, 360, 390, 768, 1024 and 1440 px across `/`, `/cycles`, `/list`, `/services`, `/recommendation`, `/contact`, `/about` |
| Bundle size (gzip) | Initial JS **128.3 kB**, CSS **23.4 kB**; lazy bicycle scene **3.0 kB** JS; `/owner` is a separate 7.0 kB chunk |
| Service worker precache | 20 hashed JS/CSS files + shell, icons and shop portrait |

### What the PWA work fixed

- The service worker now precaches every hashed build file, so pages a visitor has
  not opened yet still work offline. Before this change, an offline tap on
  “Repair” showed a blank page.
- Cached responses are matched with `ignoreVary` because some hosts add
  `Vary: Origin` to static assets, which otherwise prevented module imports from
  matching the cache.
- A route-level error boundary turns a failed chunk download on a weak connection
  into a readable retry screen instead of a blank page.
- The controller-change listener no longer reloads a first-time visitor's page
  when the worker claims it.

## Previous release verification — 2026-10-29/30

- `npm run check` passed with the then-current 23 unit/component tests and 11 browser tests.
- `npm audit --audit-level=moderate` reported 0 vulnerabilities.
- Desktop and mobile visual review completed.

## Automated checks executed

| Check | Result |
|---|---|
| `npm run check` | Passed: TypeScript, 46 unit/component tests, production build, catalog validation, PWA and SEO generation |
| `npm run test:e2e` | Passed: 18 Playwright browser tests |
| `npm run test:pwa` | Passed: 2 production service-worker/offline tests |
| `npm audit --audit-level=moderate` | 0 vulnerabilities |
| Axe WCAG 2 A/AA + 2.1 AA, primary pages at 1440px and 390px | 0 violations on Home, Cycles, My list, Services, Recommendation and Contact |
| Responsive overflow sweep | No horizontal overflow at 320, 360, 390, 768, 1024 and 1440px across the main routes, including My list |
| Production preview smoke test | All public routes return the app, one H1 per page, mobile layout fits, preview remains noindex |
| GitHub Pages base-path test | Passed with `/kanchan_cycle_store/`: deep link, query preservation, refresh and `#repair-form` restoration |

### Browser coverage

- Bengali default, English switcher and language persistence after reload.
- English navigation and localized repair validation.
- All required routes, unique page titles, footer links and useful 404.
- Category links and URL filters.
- Catalog search, category/budget/gearing filters, price sorting, unknown prices last, empty states and product-specific WhatsApp messages.
- Product detail refresh and language switching.
- Repair validation, Bengali phone digits, formatted WhatsApp enquiry, preferred date/time, acquisition source and explicit “not a confirmed booking” wording.
- Six-step quiz, back navigation, optional height, safe empty recommendation state and shareable answers.
- Mobile drawer open/close, Escape key, focus return and persistent WhatsApp/Call/Directions bar.
- Only the shop's own photographs load (any image outside `/images/shop/` fails the test), they decode successfully and no application JavaScript errors occur on the public routes.
- Click-to-load map uses the supplied coordinates; no map iframe is created before the visitor chooses it.
- Scroll-linked bicycle rotation returns to the same pose on scroll-up; reading progress resets to zero at the top.
- Bicycle view rotation/reset, explicit pause with reload persistence, and OS-level reduced motion keep content visible and disable decorative transforms.
- Lazy-loaded routes still receive reveal/tilt enhancement; mobile visitors keep native scrolling and a reachable pause control.

Fictional catalog records used by browser tests are injected only into the test browser. They are not part of `src/config/shop.ts` or the public build.

## Lighthouse — local production preview, mobile emulation

These numbers are from the **previous release**, before the Android/PWA work and
before `/list` existed. They are kept as a baseline, not a current claim. Re-run
Lighthouse against the deployed site with mobile emulation and slow 4G; the
performance budget is in [docs/ANDROID.md](docs/ANDROID.md).

| Category | Score |
|---|---:|
| Performance | **90** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | 66 — intentionally blocked from indexing while owner review/domain are pending |

Selected lab metrics:

- First Contentful Paint: **0.9 s**
- Largest Contentful Paint: **3.5 s** under Lighthouse mobile throttling
- Total Blocking Time: **120 ms**
- Cumulative Layout Shift: **0**

The home hero photograph and critical Bengali fonts are preloaded, non-home pages are code-split, the shop photographs have responsive variants, and the map is click-to-load. The SEO score is expected to improve after the real domain is configured, owner review is complete and indexing is deliberately enabled; do not enable it merely to raise a preview score.

## Limits and remaining real-world checks

- The sandbox blocks external Google map loading. The iframe URL, click-to-load behaviour and directions fallback were verified, but the live map tiles must be checked in a normal browser after deployment.
- No real WhatsApp message was sent. The owner must confirm that the supplied number receives enquiries on the shop’s device.
- No real products, prices, stock, offers, reviews or opening hours were invented. The public catalog remains empty until verified records are added.
- Automated accessibility checks are not a full screen-reader or assistive-technology audit.
- Lighthouse lab scores are not Search Console field data. Re-test on the final host and on a real mid-range Android phone over a mobile connection.
- Public deployment, domain canonicalization, sitemap submission and Google Business Profile updates have **not** been performed.
- The install prompt itself cannot be triggered by automation (Chromium only fires `beforeinstallprompt` when real install criteria and an HTTPS origin are met). The manifest, the manual install sheet, the service worker and the offline experience are tested; the final “Add to Home screen” tap must be done on a real Android phone.
- Offline behaviour depends on the visitor keeping the installed app or the site in Chrome. Clearing site data removes the cache by design.
- Supabase-backed catalogue behaviour is covered by unit tests and a local simulation only; no live project was connected. Row-level security must be verified against the owner's real project (see `docs/SUPABASE.md`).
- The n8n workflow JSON files are valid imports but were not executed against a live Supabase/Telegram/SMTP setup.
- No Play Store / Trusted Web Activity build was produced; the Bubblewrap steps in `docs/ANDROID.md` are guidance, not a tested release.
