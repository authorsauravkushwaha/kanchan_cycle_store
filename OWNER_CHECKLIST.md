# Owner launch checklist — কাঞ্চন সাইকেল স্টোর্স

All routine settings live in **`src/config/shop.ts`**. Do not publish a detail merely because a configuration field exists.

## Supplied in the brief

- [x] Bengali name: কাঞ্চন সাইকেল স্টোর্স.
- [x] English name: Kanchan Cycle Stores.
- [x] Phone / WhatsApp: +91 7076884950 / 917076884950.
- [x] Address: Kolaghat - Jashar Rd, Kolaghat, West Bengal 721134.
- [x] Coordinates: 22.4452382, 87.8751764.
- [x] Bengali default, English switcher.
- [x] Contact-for-price policy; no guessed stock.

## Still needs owner confirmation

| Setting | Current safe behaviour | Owner action |
|---|---|---|
| Opening hours | Supplied 9 AM–9 PM daily is recorded, **not shown publicly** | Confirm the interpretation, then set `hours.confirmed: true`. Update days/times/display text if different. |
| WhatsApp ownership | Links use the supplied number | Send a real test enquiry and confirm the shop receives it. No message was sent during development. |
| Bicycle catalog | Empty; useful enquiry state instead of fake products | Add verified names, brands, specifications, prices and stock. Product cards stay text-only — the site has no product images. |
| Accessories | Enquiry topics only; no claimed inventory | Add real accessory records or confirm the enquiry topics are useful. |
| Repair services | Six possible topics, all marked as requiring availability confirmation | Set `confirmed: true` only for services actually offered. Add a price only when verified. |
| Shop photographs | Six of the owner's own photographs are used (hero + About gallery), each labelled দোকানের ছবি | Confirm you are happy with the selection, captions and crops. |
| Offers | No discounts published; useful buying tips shown | Add only genuine, owner-approved offers with `verified: true`. |
| Reviews | No names, ratings or testimonials fabricated | Supply authentic reviews with permission and a genuine source URL, or a real review link. |
| Production domain | `websiteUrl: null`; preview noindex | Set the actual HTTPS URL after deployment. |
| Search indexing | Disabled pending final review | Set `seo.indexingEnabled: true` only after checking the public content. Rebuild to generate the sitemap. |
| Google Business Profile | Not invented or linked as verified | Confirm the genuine profile and add the final website URL there. A review/profile URL can then be configured. |
| Email / social profiles | Omitted | Optional: add only real, actively used details. |
| Analytics | No endpoint, no tracking requests | Optional: configure a privacy-appropriate HTTPS endpoint and update the privacy policy before collecting consent. |
| Announcement | Generic contact invitation, no offer claim | Edit the bilingual text or set `announcement.enabled: false`. |

## Product record template — documentation only

**Replace every example value with real, verified information before adding it to `shop.catalog`.** This template is not part of the public catalog.

```ts
{
  id: 'owner-product-001',
  slug: 'replace-with-real-model',
  kind: 'cycle',
  nameBn: 'আসল মডেলের নাম লিখুন',
  nameEn: 'Replace with the real model name',
  category: 'city', // kids | student | city | geared | electric | accessories
  brand: null, // A verified brand string, or null.
  price: null, // A verified INR number, e.g. 5499; never a string or a guess.
  descriptionBn: 'দোকান থেকে যাচাই করা বিবরণ লিখুন।',
  descriptionEn: 'Replace with a shop-verified description.',
  specifications: {
    geared: null, // true / false only when confirmed; otherwise null.
    frameSize: null,
    wheelSize: null,
    brakes: null,
    riderHeightCm: null, // Use a manufacturer-confirmed { min, max }, not an age guess.
    intendedUse: null, // Confirmed subset of school, commuting, recreation, mixed.
  },
  availability: null, // null | 'in-stock' | 'out-of-stock'
  featured: false,
}
```

For an accessory, use `kind: 'accessory'` and `category: 'accessories'`. Its detail page and WhatsApp enquiry work through the same catalog. Product records have **no image fields** — product cards are text-only by design, so a missing photograph never leaves an empty placeholder.

## Before announcing the website

1. Confirm hours, service availability and all product information with the shop.
2. Review the shop photographs in `public/images/shop/`: the hero uses `storefront`, and the About gallery uses six of your own pictures. Replace any picture you would rather not show, and check each caption is accurate.
3. Check the Bengali and English versions on a small Android phone.
4. Test WhatsApp, phone and Google Maps using the shop’s actual devices. **Do not send test messages to customers.**
5. Confirm that no fictional products, offers, reviews, social links or business claims appear.
6. Deploy a preview, verify every route after refresh, then configure the final domain.
7. Enable indexing and rebuild; check `/robots.txt`, `/sitemap.xml`, canonical URLs and structured data.
8. Add the published URL to the genuine Google Business Profile.
9. Keep stock, prices, hours and offers up to date. Unknown information should go back to `null`, not a guessed value.

**No public deployment, real WhatsApp delivery, verified product inventory, or confirmed appointment is claimed by this project build.**

---

## Android launch checklist (2026 update)

### Before you tell anyone the address

- [ ] Deploy to a real HTTPS domain and open it in **Chrome on an Android phone**.
- [ ] Tap **অ্যাপ ইনস্টল করুন** (or ⋮ → Install app). Confirm the icon is the wheel
      mark and the app opens without the browser bar.
- [ ] Put the phone in **airplane mode**, reopen the app: the shop page or the
      offline page must appear, and **কল করুন** / **WhatsApp** must still work.
- [ ] Confirm the WhatsApp number receives a test message from that phone.
- [ ] Check the bottom bar with the phone's gesture navigation on: nothing is
      hidden behind the Android bar.
- [ ] Increase the Android font size once and check the header and bottom bar.
- [ ] Ask one family member to install it and send a shortlist, then reply from
      the shop phone. That is the whole customer journey.

### Catalogue (choose one)

**A. Static catalogue** — for a shop that changes stock rarely.

- [ ] Add verified records to `shop.catalog` in `src/config/shop.ts`.
- [ ] `npm run check`, deploy.

**B. Live catalogue with Supabase** — recommended if stock changes weekly.

- [ ] Follow `docs/SUPABASE.md` (create project → run `supabase/schema.sql` →
      allowlist your email → set the two environment variables).
- [ ] Add the exact Supabase host to the CSP in `vercel.json` and
      `public/_headers`, or the build will stop and tell you.
- [ ] Open `/owner` on your phone, add 10 real products, export CSV, import into
      the `products` table, set `published = true`.
- [ ] Check the public `/cycles` page on a phone with mobile data off (cached
      catalogue) and on (live catalogue).

### Product data rules (unchanged, and enforced)

- [ ] A price is a real, checked number or **empty**. Empty shows “ask the shop”.
- [ ] Stock is `in-stock`, `out-of-stock`, or **empty**. Empty shows “confirm”.
- [ ] Photos are your own photographs of the actual bicycle, on HTTPS.
- [ ] No discounts, ratings, warranty claims or years-in-business unless true.
- [ ] Update stock the same day it changes. A wrong “in stock” costs a customer.

### Everyday habits that make the site sell

- [ ] Reply to every shortlist message with a real price and an offer to hold the
      cycle until the next evening.
- [ ] Ask for a Google review at handover, in person.
- [ ] Upload two or three fresh photos to the Google Business Profile each week.
- [ ] Post the weekly stock list to WhatsApp status / Google Posts (the n8n
      workflow writes it for you).
- [ ] Keep hours identical on the website, Google Maps and WhatsApp. When you are
      ready, ask for `hours.confirmed: true`.

### Account and code security (one-time setup)

These are not content settings and cannot be done from the repository. Each is a
switch in GitHub or your hosting dashboard.

- [ ] Turn on **two-factor authentication** for GitHub, the hosting account, the
      domain registrar and the DNS provider. This is the single most important
      item on this page.
- [ ] In GitHub → Settings → Code security, enable **Dependabot alerts**,
      **Secret scanning** and **Push protection**. The scheduled update workflows
      are already in the repository; these switches are not.
- [ ] After the first run on `main`, open **Security → Code scanning** and read the
      CodeQL results. Fix or dismiss each one with a sentence explaining why.
- [ ] Review Dependabot pull requests weekly. Read the diff; do not auto-merge a
      major version bump.
- [ ] Protect the `main` branch: require a pull request, require the
      `Security checks` and `CodeQL` checks to pass, and block force pushes.
- [ ] After deploying, run **Actions → Live header verification** with your real
      URL. A pass means the security headers are actually being sent — repository
      settings alone do not prove that.
- [ ] Do not enable HSTS (`Strict-Transport-Security`) until the site answers on
      HTTPS for every address you use. See `docs/SECURITY-NOTES.md`.
- [ ] Keep a private copy of the Supabase `products` table export, outside this
      repository and outside `public/`.

### Do not

- [ ] Do not use `/owner` on a shared or borrowed phone — it has no password and
      keeps drafts in that browser.
- [ ] Do not paste the Supabase **service_role** key into the website, a chat or a
      screenshot. The website only needs the public anon key.
- [ ] Do not turn on search indexing before the final content review.
