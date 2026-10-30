# কাঞ্চন সাইকেল স্টোর্স · Kanchan Cycle Stores

A Bengali-first, mobile-first static website for the real bicycle shop in Kolaghat, West Bengal. Built with React 19, TypeScript, Vite, Tailwind CSS 4 and Lucide. No backend, account system, payment gateway or database is required.

**Current status:** working website and production build prepared; **not deployed**. The catalog is intentionally empty until the owner supplies verified products. The supplied daily opening hours are recorded but **not publicly displayed**, because the brief asks for confirmation before publishing.

## Run locally

Requires Node.js **22.12+** and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. The development server binds to `0.0.0.0` and permits the Arena preview host.

```bash
npm test                 # Unit and component tests
npm run build            # Type check, static build, data validation and SEO files
npm run preview          # Serve the production build locally
npm run test:e2e         # Browser, keyboard, mobile and accessibility checks
npm run check            # Unit tests + production build
```

The browser tests use the development-only `@sparticuz/chromium` package, so they do not need a browser download from an external CDN. Alternatively, set `CHROMIUM_PATH` to an existing Chromium executable. Browser binaries are not part of the website bundle.

## What is implemented

- Natural Bengali copy, complete English UI, persistent language selection and locally hosted Hind Siliguri / Manrope fonts.
- Responsive homepage, sticky header, accessible native-dialog mobile drawer and persistent mobile WhatsApp / Call / Directions bar.
- Six category filters, searchable and sortable catalog, individual product pages and product-specific WhatsApp messages.
- Explicit unknown-price and unknown-stock handling. Unknown values never become zero or “in stock.”
- Six-step bicycle recommendation quiz, with conservative matching and a shareable answer summary.
- Repair enquiry form with bilingual validation and a formatted WhatsApp message. **It does not confirm bookings or store customer details.**
- Accessories, repair topics, offers/buying tips, about, contact, privacy, recommendation and 404 routes.
- Click-to-load Google map based on the supplied coordinates, with a directions fallback; no invented landmark or Google Business Profile.
- Page-specific titles/descriptions, Open Graph, conditional canonical URLs, verified-only LocalBusiness data, robots.txt and build-generated sitemap.
- Optional, consent-gated analytics hook; **no analytics requests are enabled by default**.
- A deliberately image-light design: the only photographs are the owner's own pictures of the shop. Text-based category, product and service cards, CSS-only decoration, lazy loading and visible keyboard focus.

## One place for business updates

Edit **`src/config/shop.ts`**. It contains:

- Bengali/English business names, announcement and tagline.
- Phone, WhatsApp, structured postal address and map coordinates.
- Opening hours and their confirmation flag.
- Product catalog, categories, service availability/prices, offers and permitted reviews.
- Website URL, indexing flag, email, social links, shop photographs (`heroPhoto`, `gallery`), review URL, budget ranges and analytics endpoint.

Read **[OWNER_CHECKLIST.md](OWNER_CHECKLIST.md)** before launch. It distinguishes supplied details from pending owner confirmation and includes a product-record template.

### Contact details currently configured

- Phone / WhatsApp: **+91 7076884950** / **917076884950**.
- Address: **Kolaghat - Jashar Rd, Kolaghat, West Bengal 721134**.
- Coordinates: **22.4452382, 87.8751764**.
- Hours supplied for confirmation: **every day, 9 AM–9 PM**. They are displayed with a visible
  "subject to the owner's final confirmation" caveat, and `hours.confirmed` remains `false`, so no
  opening-hours structured data is published.

WhatsApp links use `https://wa.me/917076884950?text=...` with URL-encoded Bengali or English messages. Product messages include the product name and a real page URL. Repair messages include the selected service and the customer’s preferred date/time, with an explicit manual-confirmation notice.

### Add a real product

1. Add one record to `shop.catalog`, using the template in the owner checklist.
2. Supply both Bengali and English names and descriptions.
4. Use a number for `price` **only after verification**; otherwise use `null`.
4. Use `availability: null` until stock is checked. Known values are `in-stock` and `out-of-stock`.
5. Include only confirmed specifications. Unknown gearing is `null`, not `false`.
6. Set `featured: true` to show a cycle in the homepage selection.
7. Run `npm run check`. Duplicate IDs/slugs, negative prices and inconsistent categories fail the build.

Catalog records drive the homepage, filters, detail pages, recommendations, WhatsApp messages and sitemap. Fictional fixtures exist **only under `tests/`** and are never imported into the application.

### Photographs and honesty

The website is text-first. There are **no stock photographs, illustrations or product images**.
The only pictures are the shop's own photographs, supplied by the owner in October 2026 and stored
in `public/images/shop/`:

- one portrait photograph of the shopfront in the homepage hero (`shop.heroPhoto`);
- two of them in the homepage "our shop" strip and six in the About gallery (`shop.gallery`).

Every one is labelled **দোকানের ছবি / Shop photo**, and the captions describe only what is visible.
Photographs are never shown as catalogue products, and product cards are text-only. See
[PHOTO_CREDITS.md](PHOTO_CREDITS.md) for the file list and how to replace a photograph. An automated
test fails if any image outside `/images/shop/` is requested.

There are no invented products, prices, discounts, ratings, review counts, warranties, certifications or years in business. Unconfirmed repair topics are presented as questions to ask, not promises of service.

## Routes

`/`, `/cycles`, `/cycles/:slug`, `/accessories`, `/services`, `/recommendation`, `/offers`, `/about`, `/contact`, `/privacy`, plus an accessible 404.

## Deployment

### Vercel — recommended for clean route URLs

1. Import the repository into Vercel.
2. Select **Vite**, build command `npm run build`, output directory `dist`.
3. Deploy a private preview and check it on a real phone.
4. Once the final domain is known, set `websiteUrl` in `src/config/shop.ts` (or the build environment variable `VITE_SITE_URL`).
5. Complete owner review, then set `seo.indexingEnabled: true` and rebuild.

`vercel.json` includes the SPA rewrite and conservative security headers. It does not block iframe embedding. No environment secrets are needed.

### GitHub Pages

A workflow is included at `.github/workflows/deploy.yml`. It runs on pushes to `main` or manual dispatch; it has **not** been run by this implementation.

1. In repository settings, set **Pages → Source → GitHub Actions**.
2. Optionally set the repository variable `SITE_URL` to the real HTTPS site URL.
3. The default base path is `/<repository-name>/`. For a custom domain/root deployment, set `PAGES_BASE_PATH` to `/`.
4. Merge the reviewed source to `main`, or deliberately run the workflow on the intended deployment source.
5. Confirm the actual Pages URL before announcing publication.

The build generates a base-path-aware `404.html`. It preserves the requested route/query in same-origin session storage, redirects to the app entry, and restores the URL before React Router starts. This supports direct links and refreshes on GitHub Pages. Vercel/Netlify use normal SPA rewrites instead.

### Netlify / another static host

Build with `npm run build`, publish `dist`, and use the included `_redirects` file (`/* /index.html 200`). On hosts without rewrite support, use the generated GitHub-style 404 fallback. Set `VITE_BASE_PATH` when serving below a subdirectory. Serve over HTTPS.

## SEO and indexing

The preview is intentionally **noindex** and `robots.txt` disallows crawling until owner review. After configuring the real website URL and enabling indexing, the build generates `sitemap.xml`, an allowing robots policy, canonicals and Open Graph URLs. Product pages are included automatically.

Structured data uses Schema.org **Store**, a valid LocalBusiness subtype. It includes only configured business facts and coordinates. Unconfirmed hours, missing website URLs, illustrative product images, unknown offers, ratings and reviews are omitted. The map pin is not described as a verified Google Business Profile. Once the owner confirms the genuine profile, add the published website URL there manually.

## Privacy and analytics

Only the selected language is saved in local storage. Quiz answers and repair/contact details remain in React memory and are shared through WhatsApp only when the visitor chooses to send them. No customer database or unconfigured form service is used.

`analytics.endpoint` defaults to `null`. If the owner later configures a valid HTTPS collection endpoint, events are sent **only after explicit consent** on the Privacy page. Supported events: WhatsApp clicks, calls, directions, product enquiries, repair submissions, quiz completions and source sharing. Events may include a product/service ID and placement, never names, phone numbers or message bodies. Configure the endpoint’s own CORS, retention, privacy disclosures and security before enabling it.

The contact and repair forms optionally ask how the customer heard about the shop. The answer is included in the WhatsApp message so the owner can record it manually; it is not silently stored.

Google Maps is an external iframe loaded only after the visitor chooses “Load the Google map.” A directions link remains available if the embed is blocked. WhatsApp, phone and map providers have their own privacy terms, explained on the Privacy page.

## Project structure

```text
src/config/shop.ts          Single owner configuration and catalog
src/i18n.tsx                Complete Bengali/English UI copy
src/components/             Header, footer, cards, filters, forms, map, SEO
src/pages/                  Route pages
src/lib/                    URL helpers, filtering, quiz matching, validation
src/styles.css              Tailwind theme and responsive design system
public/images/shop/         The owner's own photographs of the shop (the only images)
scripts/generate-seo.ts     Data checks, sitemap, robots and Pages fallback
tests/                      Isolated fixtures, unit/component/browser tests
```

## Quality checks

See [TESTING.md](TESTING.md) for the executed checks and remaining real-device/owner checks. Automated accessibility tests are not a substitute for a full assistive-technology audit. No Lighthouse score or public deployment is claimed without an actual measurement/deployment.

## Security deployment

See [SECURITY_REPORT.md](SECURITY_REPORT.md) for the 100-control audit, hosting limitations, required dashboard settings and recovery runbook. Run `npm run security:check` after `npm run build`; production security headers in `vercel.json` **do not apply to GitHub Pages**.
