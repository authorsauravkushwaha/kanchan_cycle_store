# Testing and quality checks

Initial checks: **2026-10-29**. Pre-push verification: **2026-10-30**. Environment: local development and production-preview builds in the Arena sandbox. This is **not** a public deployment or a field-data Core Web Vitals report.

## Pre-push verification — 2026-10-30

- `npm run check`: passed again, including all 23 unit/component tests, TypeScript, production build, catalog validation and SEO generation.
- `npm run test:e2e`: passed all 11 browser tests, including bilingual navigation, catalog filtering with isolated fixtures, repair messages, quiz, mobile navigation, responsive overflow and automated accessibility checks.
- `npm audit --audit-level=moderate`: reported 0 vulnerabilities.
- Desktop and mobile visual review completed; the live development preview remains available in the workspace.
- The Lighthouse results below are from the earlier local production-preview run, not a new measurement on a public host.

## Automated checks executed

| Check | Result |
|---|---|
| `npm run check` | Passed: TypeScript, 23 unit/component tests, production build, catalog validation and SEO generation |
| `npm run test:e2e` | Passed: 11 Playwright browser tests |
| `npm audit --audit-level=moderate` | 0 vulnerabilities |
| Axe WCAG 2 A/AA + 2.1 AA, primary pages at 1440px and 390px | 0 violations on Home, Cycles, Services, Recommendation and Contact |
| Responsive overflow sweep | No horizontal overflow at 320, 360, 390, 768, 1024 and 1440px across the main routes |
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
- Local images decode successfully; no application JavaScript errors on the public routes.
- Click-to-load map uses the supplied coordinates; no map iframe is created before the visitor chooses it.

Fictional catalog records used by browser tests are injected only into the test browser. They are not part of `src/config/shop.ts` or the public build.

## Lighthouse — local production preview, mobile emulation

Latest run against `http://127.0.0.1:4173/`:

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

The home hero image and critical Bengali fonts are preloaded, non-home pages are code-split, local images have responsive variants, and the map is click-to-load. The SEO score is expected to improve after the real domain is configured, owner review is complete and indexing is deliberately enabled; do not enable it merely to raise a preview score.

## Limits and remaining real-world checks

- The sandbox blocks external Google map loading. The iframe URL, click-to-load behaviour and directions fallback were verified, but the live map tiles must be checked in a normal browser after deployment.
- No real WhatsApp message was sent. The owner must confirm that the supplied number receives enquiries on the shop’s device.
- No real products, prices, stock, offers, reviews or opening hours were invented. The public catalog remains empty until verified records are added.
- Automated accessibility checks are not a full screen-reader or assistive-technology audit.
- Lighthouse lab scores are not Search Console field data. Re-test on the final host and on a real mid-range Android phone over a mobile connection.
- Public deployment, domain canonicalization, sitemap submission and Google Business Profile updates have **not** been performed.
