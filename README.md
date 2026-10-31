# কাঞ্চন সাইকেল স্টোর্স · Kanchan Cycle Stores

A Bengali-first, **Android-first** website for the real bicycle shop in Kolaghat,
West Bengal. It installs from Chrome on Android like an app, keeps working on a
weak connection, and turns a Google Maps visit into a WhatsApp message, a call or
a walk-in.

Built with React 19, TypeScript, Vite, Tailwind CSS 4 and Lucide. No account
system, payment gateway or mandatory backend. An optional Supabase catalogue lets
the owner update stock from a phone.

**Current status:** working website and production build prepared; **not
deployed**. The catalogue is intentionally empty until the owner supplies verified
products — see [Why the catalogue starts empty](#why-the-catalogue-starts-empty).
Opening hours are recorded but not published as confirmed data.

---

## What a customer on a phone gets

- **Install it like an app.** Manifest, maskable icons, standalone display, home
  screen shortcuts, an install prompt that respects “no”, and an update notice
  when a new version is ready.
- **Works offline.** A service worker caches the page shell, the shop's photos and
  the last catalogue; the offline page still dials the shop and opens WhatsApp.
- **One thumb.** Sticky bottom bar: WhatsApp · Call · Directions · My list.
  Everything is above the Android gesture area.
- **A shortlist instead of a cart.** Save cycles while browsing, then send the
  whole list to the shop as one itemised WhatsApp message.
- **Arrives from Google Maps.** A `?utm_source=google-maps` visit gets a short
  “call or get directions” strip above the fold.
- **Real answers, not guesses.** Unknown price says “ask the shop”; unknown stock
  says “stock to confirm”. Nothing is invented to look complete.
- **Bengali first, English available.** Both languages are complete, not a partial
  translation, and the choice is remembered.
- **A tactile, 3D scroll experience.** Neumorphic sage surfaces, a rotatable
  SVG/CSS bicycle on a sculpted plinth, and scroll-linked motion that reverses
  when you scroll back up. Native touch/wheel scrolling is preserved, with a
  pause control and full respect for `prefers-reduced-motion`.

Owner-side additions: a phone-friendly **stock desk** at `/owner` that exports the
exact CSV for Supabase, an optional live catalogue, and three importable n8n
workflows for stock alerts and WhatsApp post text.

## Run locally

Requires Node.js **22.12+** and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. The dev server binds to `0.0.0.0`.

```bash
npm test                 # Unit and component tests (46)
npm run build            # Type check, static build, data validation, PWA + SEO files
npm run preview          # Serve the production build locally
npm run test:e2e         # Browser, keyboard, mobile, offline-relevant and axe checks
npm run test:pwa         # Production service-worker and offline tests (build first)
npm run check            # Unit tests + production build
npm run security:check   # Run the standalone header, PWA, RLS and secret checks (also part of build)
npm run security:headers -- https://YOUR-DOMAIN  # Check headers the live site actually sends
npm run icons            # Regenerate the Android icon set from vector artwork
```

The browser tests use the development-only `@sparticuz/chromium` package, so they
do not download a browser from an external CDN. Alternatively set `CHROMIUM_PATH`.
Browser binaries are never part of the website bundle.

## Routes

`/`, `/cycles`, `/cycles/:slug`, `/services`, `/recommendation`,
`/list`, `/offers`, `/about`, `/contact`, `/privacy`, plus an accessible 404.
`/owner` is a device-local tool for the shop owner and is not linked publicly.

## Android, PWA and the Play Store

Read **[docs/ANDROID.md](docs/ANDROID.md)** for install steps, real-device testing,
the performance budget and the optional Trusted Web Activity wrapper for a Play
Store listing.

| File | Purpose |
| --- | --- |
| `public/manifest.webmanifest` | Name, icons, standalone display, shortcuts |
| `public/sw.js` | Offline app shell, same-origin asset/image caching, update flow |
| `public/offline.html` + `offline.css` | Offline page with working call/WhatsApp links |
| `src/pwa.tsx` | Install prompt, update detection, online state, Maps arrival source |
| `src/components/Install.tsx` | Bottom-sheet install explanation |
| `scripts/generate-icons.mjs` | Regenerates the icon set with Sharp |

The service worker is registered **only in production builds**, so it never
interferes with development or the Playwright suite.

## Selling with the site

- **Shortlist:** `src/shortlist.tsx`, `src/lib/shortlist.ts`, `/list`. Stored on the
  customer's phone, sent only when they choose.
- **Live catalogue:** `src/lib/inventory.ts` reads published Supabase rows when
  configured, caches the last good response on the device, and otherwise uses the
  static catalogue. `productFromRow()` is pure and unit-tested.
- **Stock desk:** `/owner` prepares product records and exports CSV/JSON. It is
  deliberately not a secure admin panel and says so.
- **Automation:** [automation/README.md](automation/README.md) contains n8n
  workflows for a daily stock watch, a weekly catalogue-health report and
  Bengali WhatsApp post text.

Budget and planning guidance is in
**[docs/SALES_PLAYBOOK.md](docs/SALES_PLAYBOOK.md)** — Google Business Profile,
WhatsApp Business, reviews, seasonal stock, and the 30-day plan.

## Catalogue and unconfirmed information

The catalogue includes 23 product photographs supplied by the shop across 21
bicycles, including the Hercules Top Gear Defender FX DD and Tata Stryder
Harris-X IC DD premium models. Prices and availability are not guessed, and the
supplied specifications are shown in each product description. The shop can
confirm current details directly.

Add products in either of two ways:

1. **Static (no backend):** edit the supplied entries in `src/config/cycles.ts` or `shop.catalog` in `src/config/shop.ts`, then rebuild.
2. **Live (phone updates):** follow [docs/SUPABASE.md](docs/SUPABASE.md), then use
   `/owner` to export the CSV and import it into Supabase. Flipping `published`
   changes the live site without a rebuild.

Fictional fixtures live **only** under `tests/` and are never imported by the app.

## One place for business updates

Edit **`src/config/shop.ts`**: names, announcement, phone, WhatsApp, address,
coordinates, hours and their confirmation flag, categories, services, offers,
reviews, budgets, shop photos, analytics endpoint and the optional seed catalogue.

Read **[OWNER_CHECKLIST.md](OWNER_CHECKLIST.md)** before launch. It separates
supplied facts from pending confirmations and includes a product template.

### Contact details currently configured

- Phone / WhatsApp: **+91 70768 84950** / **917076884950**.
- Address: **Kolaghat - Jashar Rd, Kolaghat, West Bengal 721134**.
- Coordinates: **22.4452382, 87.8751764**.
- Hours supplied for confirmation: **every day, 9 AM–9 PM**, shown with a visible
  caveat. `hours.confirmed` stays `false`, so no opening-hours structured data is
  published.

WhatsApp links use `https://wa.me/917076884950?text=...` with URL-encoded Bengali
or English messages. Product messages include the product name and a real page
URL; repair and shortlist messages state that nothing is booked until the shop
replies.

## Environment variables

All optional; the site is fully functional without them.

| Variable | Effect |
| --- | --- |
| `VITE_SITE_URL` | Production HTTPS URL for canonical links, sitemap, WhatsApp product links |
| `VITE_BASE_PATH` | Host below a sub-path (GitHub Pages project sites) |
| `VITE_SUPABASE_URL` | Enables the live catalogue |
| `VITE_SUPABASE_ANON_KEY` | Public read-only key (never the service-role key) |

If Supabase is configured, the CSP must name that exact host — `npm run
security:check` fails the build until it does, instead of shipping a block or a
wildcard.

## Deployment

### Vercel (recommended)

1. Import the repository, framework **Vite**, build `npm run build`, output `dist`.
2. Deploy a preview and test it on a real Android phone.
3. Set `VITE_SITE_URL` (or `websiteUrl`) once the domain is known.
4. After owner review, set `seo.indexingEnabled: true` and rebuild.

`vercel.json` provides the SPA rewrite, a strict CSP (including `manifest-src` and
`worker-src`), long-lived asset caching, and no-cache rules for `sw.js` and the
manifest.

### GitHub Pages

`.github/workflows/deploy.yml` builds on pushes to `main` or manually. Set
**Pages → Source → GitHub Actions**, optionally `SITE_URL` and `PAGES_BASE_PATH`.
A base-path-aware `404.html` preserves deep links. **GitHub Pages cannot set a
CSP**, so treat it as a preview, not the production storefront.

### Netlify / Cloudflare Pages

Publish `dist`; `public/_redirects` and `public/_headers` are included. Keep the
host-specific headers in step with `vercel.json`.

## SEO and structured data

The preview is `noindex` and `robots.txt` disallows crawling until owner review.
After a real URL and `indexingEnabled: true`, the build generates `sitemap.xml`,
an allowing robots policy, canonicals and Open Graph URLs; product pages are added
automatically.

Structured data uses Schema.org **Store** with only configured facts. Unconfirmed
hours, unknown prices, ratings and reviews are omitted. The map pin is not
described as a verified Google Business Profile.

## Privacy

Only the selected language and the shortlist are stored in `localStorage`. Form
and quiz answers stay in React memory and go to the shop only through WhatsApp.
No customer database exists. Analytics are disabled by default; if an HTTPS
endpoint is configured, events are sent only after explicit consent and contain
no names, phone numbers or message bodies.

Google Maps is an external iframe, loaded only after the visitor chooses to load
it. No fonts, icons or scripts are requested from a third party.

## Project structure

```text
src/config/shop.ts          Owner configuration and static catalogue seed
src/i18n.tsx                Complete Bengali/English copy
src/pwa.tsx                 Install, offline and update state
src/inventory.tsx           Catalogue provider (static, cache, live)
src/shortlist.tsx           Device-local shortlist provider
src/components/             Header, footer, cards, filters, forms, map, install UI
src/pages/                  Route pages, including Shortlist and OwnerDesk
src/lib/                    URLs, filtering, quiz, validation, inventory, shortlist, stock desk
src/styles.css              Tailwind theme and responsive design system
public/                     Manifest, service worker, offline page, icons, photos
scripts/                    SEO/PWA build checks, icon generation, security checks
supabase/schema.sql         Optional catalogue schema with row-level security
automation/n8n/             Optional stock/WhatsApp workflows
docs/                       Android, Supabase, sales and security notes
tests/                      Isolated fixtures, unit/component/browser tests
```

## Reference projects

Seven repositories informed this work. [docs/REFERENCES.md](docs/REFERENCES.md)
records exactly what was used (Supabase schema, n8n workflows, Cloudflare's audit
method), what was deliberately not used (MiroFish forecasts without data, PentAGI
against someone else's infrastructure) and why the Android answer is a PWA first.

## Quality checks

See [TESTING.md](TESTING.md). Automated accessibility tests are not a substitute
for a full assistive-technology audit, and no Lighthouse score or deployment is
claimed without measuring it.

## Security

See [docs/SECURITY-CONTROLS.md](docs/SECURITY-CONTROLS.md) for the current
site-specific controls and honest scope limits, [SECURITY_REPORT.md](SECURITY_REPORT.md)
for the broader audit/runbook, and [docs/SECURITY-NOTES.md](docs/SECURITY-NOTES.md)
for PWA/Supabase deployment notes.
