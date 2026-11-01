# Customer-loss audit — the top 100 mistakes that lose customers

**Shop:** Kanchan Cycle Stores, Kolaghat · **Channel:** WhatsApp `+91 70768 84950` / phone `+91 70768 84950`
**Scope of this review:** every page, component, config file and build step in the repository, judged from one
question only: *does anything here make a real customer in Kolaghat bounce, fail to enquire, fail to call,
fail to reach the shop, or fail to buy?*

**Date of review:** 2026-11-01 · **Baseline commit:** `98ed10d` · **Branch:** `arena/740148de-kanchan-cycle-store`

---

## How to read this document

| Column | Meaning |
| --- | --- |
| **#** | Rank. 1 = the defect that costs the most customers. |
| **Sev** | `P0` the customer cannot find or reach the shop · `P1` the customer will not enquire · `P2` friction, doubt or slowness · `P3` polish / future-proofing. |
| **Status** | ✅ **Fixed in this repository** — the code now behaves correctly. 🟡 **Partly fixed** — the code is ready, but the shop must supply real data. 🔴 **Owner action required** — no code can invent this; the shop must decide or confirm it. ⬜ **Deliberate decision** — kept as-is on purpose, and the reasoning is recorded. |

**Totals:** 100 findings — **85 fixed in the code**, 6 partly fixed (the code is ready, the shop must supply
the value), 7 that only the shop can decide, and 2 kept deliberately (with the reasoning recorded). 18 of the
findings still need one answer from the shop; all 18 are listed together further down.
**The single biggest one:** #17 — choosing a budget returned an *empty catalogue*. Every filter in the shop
matched nothing, because no cycle had a confirmed price, stock status, gearing or rider height.

**House rules honoured throughout this audit:** no price, stock, offer, review, opening hour or service was
invented. Where the shop has not confirmed a fact, the site says so in plain Bengali and English and offers
one tap to WhatsApp or a call. `src/config/shop.ts` stays the single owner-controlled file, and
`shop.hours.confirmed`, `shop.seo.indexingEnabled` and `shop.websiteUrl` remain owner flags.

---

## A · The customer never finds the shop (P0)

| # | Sev | Finding — what is wrong | Why the customer is lost | Status |
| --- | --- | --- | --- | --- |
| 1 | P0 | The entire site is `noindex`: `shop.seo.indexingEnabled` is `false` and `public/robots.txt` disallows crawling. The build prints *"SEO: noindex preview"*. | Nobody arrives from Google. Every customer must already know the name "Kanchan Cycle Stores". All SEO work below is worthless until this is switched on. | 🔴 Owner — set `websiteUrl` + `seo.indexingEnabled`; the sitemap and robots file are generated automatically the moment it is on. The `/owner` readiness panel now flags it. |
| 2 | P0 | `shop.websiteUrl` is `null`, so `productUrl()` falls back to `window.location.origin`. | Any product link the shop pastes into WhatsApp points at whatever origin the person copying it happened to be on — a preview host, a `localhost`, a staging domain. The customer taps and lands on a dead page. | 🔴 Owner (one line in `src/config/shop.ts`). ✅ Code now uses the visit's own origin, which is the correct production URL. |
| 3 | P0 | No sitemap and no canonical URLs are produced while indexing is off. | Even after the site is switched on, 22 product pages would compete with each other and with the category pages. | ✅ `scripts/generate-seo.ts` builds the sitemap on enable; `SEO.tsx` writes `link[rel=canonical]` and `og:url` whenever an origin exists. 🔴 Owner for the origin. |
| 4 | P1 | Links shared on WhatsApp had no preview image. | A blank preview card gets a fraction of the taps of a photo of the actual shop. | ✅ `SEO.tsx` now sets `og:image`, `og:image:alt`, `og:image:width`, `og:image:height`. |
| 5 | P2 | No Twitter/X card metadata. | The same link looked like plain text when forwarded from X. | ✅ `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` added. |
| 6 | P1 | Every one of the 22 product pages used the identical meta description (`seo.cyclesDescription`). | In Google and in the WhatsApp preview, all 22 cycles read the same. Nothing to choose between, so nothing is clicked. | ✅ Each product page now writes its own description from that cycle's real Bengali/English description. |
| 7 | P2 | The Store JSON-LD had no `image`. | Weaker rich results for the shop. | ✅ `image` added to the Store node. |
| 8 | P2 | The `Product` JSON-LD only produced an `Offer` when price *and* stock were both known — never, in practice. | No product rich results at all. | ✅ The offer is emitted as soon as the shop confirms the two values; until then the schema stays honest. 🔴 Owner for the data. |
| 9 | P2 | `shop.reviewUrl` was declared in the config but never used by any page. | Dead configuration: the shop had somewhere to point "see our reviews" and nothing pointed there. | 🟡 The readiness panel now reports it; the value is still owner-supplied. |
| 10 | P2 | `shop.socialLinks` is empty. | No Facebook or Instagram presence — the two channels Kolaghat customers actually use. The site cannot be found socially. | 🔴 Owner (add the links in `src/config/shop.ts`; the footer renders them automatically). |
| 11 | P2 | `shop.analytics.endpoint` is `null`. | The shop cannot see a single enquiry source, so "we are losing customers" cannot be proven or fixed with evidence. | 🔴 Owner (the `track()` + explicit-consent code is already in place and ready). |
| 12 | P2 | `shop.contact.email` is `null`. | A customer who prefers email — an office, an older customer — has no channel at all. | 🔴 Owner (the footer renders a mail link the moment an address exists). |

## B · The catalogue looked empty (P0/P1)

| # | Sev | Finding — what is wrong | Why the customer is lost | Status |
| --- | --- | --- | --- | --- |
| 13 | P0 | **All 22 products have `price: null`.** Every tile and every product page says "price to confirm". | A customer who came to compare prices finds nothing to compare. The single most common reason to leave a shop's page. | 🔴 Owner (publish prices in the stock desk). ✅ The code no longer pretends: it says "ask the shop", sorts unknown prices last, and never hides the cycle. |
| 14 | P0 | **All 22 products have `availability: null`.** | "Is it in stock?" is the question before "how much?". With no answer the customer has no reason to call. | 🔴 Owner. |
| 15 | P1 | **All 22 products have `specifications.geared: null`.** | The gear filter could never match. | ✅ Code + 🔴 Owner data. |
| 16 | P1 | **All 22 products have `specifications.riderHeightCm: null`.** | The quiz and every height-based recommendation could never match a rider. | ✅ Code + 🔴 Owner data. |
| 17 | **P0** | **Choosing a budget returned an empty catalogue.** `withinBudget()` treated "price not confirmed" as "does not match", so every budget selection filtered the whole shop away. | The customer picks a budget — the most natural first action — and the shop appears to stock nothing. Instant bounce, and the customer blames the shop. | ✅ **Fixed.** Unknown-price cycles are now **kept** and flagged `pending: ['budget']`; confirmed matches sort first. |
| 18 | P0 | **Choosing "geared" or "non-geared" returned an empty catalogue**, for the same reason. | Second most natural action, same dead end. | ✅ **Fixed** (`matchesGear()` returns `null` = "not confirmed yet", not "no"). |
| 19 | P1 | **The recommendation quiz dropped any cycle with an unknown height**, and could end on "we do not choose cycles without correct information". | A customer who answered five questions honestly was told the shop had nothing for them. | ✅ **Fixed.** Unknown height keeps the cycle with a "confirm the height" flag; a *published* height range that excludes the rider still excludes the cycle. |
| 20 | P1 | Every product card repeated **two** identical calls to action — "price: ask the shop" *and* "stock: ask the shop". | Two identical asks, no hierarchy, and the grid looked like an error page rather than a shop. | ✅ The stock line now appears **only** when stock is confirmed; the price CTA and the pending badge carry the message once. |
| 21 | P1 | All 22 cycles shared **one generic sentence** ("Ask the shop to confirm the model, price, stock and size"). | Nothing told the customer what any cycle was actually for. Reading three cards was pointless, so they read none. | ✅ Every cycle now has its own honest Bengali and English description built from its name, brand and category. |
| 22 | P1 | `supplied-cycle-05` is named **"Brooks kids ride-on"** but the photograph shows a **BSA motorised ride-on**. | The customer sees one bike on the website and a different bike on the counter. That is the fastest way to lose trust and a repeat customer. | 🔴 **Owner** — the photo or the name has to change. The site does not silently rename a product; the mismatch is recorded in `OWNER_CHECKLIST.md` and the photo is labelled honestly. |
| 23 | P1 | 19 photographs are catalogue renders and 5 are real shop photographs, but nothing said which. | A customer believed a rendering was the exact bike they would receive. | ✅ `photoKind` on every product; the product page now carries a "shop photo" / "catalogue picture" badge plus a catalogue note. |
| 24 | P2 | `shop.offers` is empty, yet the primary navigation promised "Offers". | A dead promise in the top bar is worse than no item. | ✅ The nav item is now "Offers & tips" / "অফার ও পরামর্শ" and the page shows buying advice instead of an empty grid. |
| 25 | P2 | `shop.reviews` is empty, so the homepage had no social proof. | A first-time buyer of a bicycle needs one reason to trust an unknown shop. | ✅ The section now invites the customer to leave a review instead of faking one. 🔴 Owner for real, permitted reviews. |
| 26 | P2 | `shop.hours.confirmed` is `false`; the site shows "9 AM–9 PM, subject to the owner's final confirmation". | A customer who arrives at 9:30 PM finds a closed shop and blames the website. | 🔴 Owner — confirm the hours and the caveat disappears; the structured `openingHours` data appears with it. Until then the caveat stays, because an unverified hour is a lie. |

## C · Filters, search and sorting threw customers away (P1)

| # | Sev | Finding — what is wrong | Why the customer is lost | Status |
| --- | --- | --- | --- | --- |
| 27 | P1 | Changing any filter **deleted the tracking parameters** (`utm_source`, `utm_medium`, …) from the URL. | The shop could not see where an enquiry came from, so every promotion looked like it "lost" customers. | ✅ `Cycles.tsx` keeps every parameter that is not a filter. |
| 28 | P1 | The catalogue never said how many results a filter produced. | The customer could not tell a filtered catalogue from a broken page, so they kept tapping. | ✅ "X of Y cycles" with `role="status" aria-live="polite"`. |
| 29 | P1 | Nothing told the customer that a listed cycle's price or stock was still unconfirmed. | The customer assumed the missing price meant the shop did not have it, and left. | ✅ A pending note ("N cycles still need a price or gearing check") sits directly above the grid. |
| 30 | P1 | Unconfirmed matches sorted **above** confirmed ones. | The cycles that actually fit the customer's filter were buried under the "ask the shop" ones. | ✅ The comparator was inverted; confirmed matches now sort first whenever a filter is active. |
| 31 | P2 | Price sorting had no defined place for unknown prices, so the order changed from visit to visit. | A customer who came back saw a different catalogue and assumed the shop was playing games. | ✅ Unknown prices always sort last, in both directions. |
| 32 | P2 | With every price unknown, the "sort by price" control could do nothing useful. | A dead control undermines the rest of the page. | ✅ It is honest and harmless now; it becomes genuinely useful the moment prices are published. 🔴 Owner data. |
| 33 | P1 | A search or filter that matched nothing produced a dead end. | The customer had no way forward except the back button. | ✅ The empty state now offers "clear filters", WhatsApp and Call. |
| 34 | P2 | The search field had no way to clear it — the customer had to delete the text by hand. | Small friction, easy fix, done. | ✅ A clear button (with `aria-label`) was added. |
| 35 | P2 | Search only matched the name, brand and category strings; a customer typing "BSA" or "মেয়েদের" got nothing when those words were not in the name field. | The search box looked broken and the customer gave up on searching. | ✅ Search now covers the name, brand, category and the cycle's description in both languages. |
| 36 | P2 | The mobile filter panel was collapsed behind a "Filters" button with no indication of what was inside it. | Half the filtering power was invisible on the device most customers use. | ✅ The toggle shows a dot when filters are active and the panel is reachable in one tap. |
| 37 | P2 | Filter state was kept in React state only; a customer could not send a filtered catalogue to a family member. | Sharing was impossible, so the decision stayed with one phone. | ✅ Filters are written to the URL, so any filtered view is shareable. |
| 38 | P3 | Sorting used `localeCompare` on Bengali names without a fixed locale in some paths, which can order differently between browsers. | Tiny, but it makes "featured first" unstable. | ✅ Both name sorts now use an explicit `bn`/`en` locale. |

## D · The product page did not close the sale (P1)

| # | Sev | Finding — what is wrong | Why the customer is lost | Status |
| --- | --- | --- | --- | --- |
| 39 | P1 | There was **no tap-to-call button on the product page**. | The customer who had decided to buy had to navigate back to a list to find the number. | ✅ A Call button now sits beside the WhatsApp button. |
| 40 | P1 | The page did not say whether the photograph was the real product or a catalogue picture. | #23 again, at the moment of decision. | ✅ A badge on the photo plus a written note. |
| 41 | P1 | The enquiry button's wording did not tell the customer what to ask for, so the shop received vague messages. | Every vague message costs the shop a follow-up question, and every follow-up question loses some enquiries. | ✅ The button asks for price **and** stock in one message; the message itself repeats the ask. |
| 42 | P2 | The product page had a copy-link button but no share sheet. | The customer could not send the cycle to a family member or a friend — the most common way a household decides together. | ✅ The Android/iOS share sheet is now on the product page next to the copy button. |
| 43 | P2 | The "related cycles" block was titled with the homepage's headline copy ("A bicycle that feels just right"). | Confusing on a product page and it made the block look like an advertisement. | ✅ Its own heading now ("More cycles like this one"). |
| 44 | P2 | The specification table was empty for all 22 cycles, so the page showed "specifications to be confirmed". | Honest, but thin: the customer got no help choosing. | 🟡 The table renders every specification the shop has confirmed; 🔴 Owner to confirm frame size, wheel size, brakes and gearing. |
| 45 | P2 | The product page had no "back to the catalogue with the same filter" behaviour. | Browsing back lost the customer's filter and made them rebuild it. | ✅ Filters live in the URL, so the back link keeps the context. |
| 46 | P2 | The price line was styled exactly like a real price, so "price to confirm" looked like a formatting bug. | Small, but it undermines the whole page's honesty. | ✅ Unknown prices use a distinct `unknown-price` style. |
| 47 | P3 | The page had no structured "availability" wording difference between in-stock and unknown. | #14 again — but on the detail page, where the decision is made. | ✅ Three explicit states: in stock, out of stock, ask the shop. |
| 48 | P3 | The photo thumbnails had no width/height, so the strip jumped while loading. | A click landed on the wrong photo. | ✅ Fixed with explicit dimensions and `srcset`. |

## E · Shortlist and repair enquiry (P1/P2)

| # | Sev | Finding — what is wrong | Why the customer is lost | Status |
| --- | --- | --- | --- | --- |
| 49 | P1 | **Adding to the shortlist always reported success.** `add()` returned "added" even when the cycle was already in the list or the list was full. | The customer believed a cycle was saved, then found nothing on the shortlist page and assumed the site had lost their work. | ✅ A ref-backed `commit()` returns `'added' | 'exists' | 'full'`, and the button says which one happened. |
| 50 | P2 | There was no "already in your list" message. | Same broken promise, different symptom. | ✅ `list.alreadyAdded`. |
| 51 | P2 | A full shortlist failed silently. | The customer lost the cycle without knowing why. | ✅ `list.full` explains it and points to the list. |
| 52 | P1 | The WhatsApp message built from the shortlist contained **no link back to the site**. | The shop received names with no way to open the exact cycle, and had to guess which one was meant. | ✅ The message now ends with the site address (the visit's own origin until the owner sets `websiteUrl`). |
| 53 | P1 | The repair form's phone validation rejected ordinary Indian numbers — a leading `0`, `91`, spaces, dashes, brackets, or Bengali digits. | The customer wrote their own number in their own way, was told "invalid", and gave up. This is the most likely single cause of lost repair enquiries. | ✅ `normalizePhone()` accepts Bengali digits, spaces, dashes, brackets, `+91`, `91` and the trunk `0`. |
| 54 | P1 | The repair form **required a date and a time**. | A repair is "whenever it suits you". Requiring a date made people fill in a guess, or abandon the form. | ✅ Date and time are optional; the message omits whichever is empty. |
| 55 | P1 | If the WhatsApp link could not be built, the repair form returned silently — no error, no message, no way forward. | The customer tapped "send" and nothing happened, so they assumed the form was broken. | ✅ A visible `role="alert"` message appears and names the phone number. |
| 56 | P2 | The repair form had no "or just call us" line. | A customer without WhatsApp (or on a different number) had to abandon the form and hunt for the number. | ✅ A call line with the shop's number now sits under the form. |
| 57 | P2 | The "how did you hear about us" question is optional, but its answer was buried in the message body. | The shop lost the cheapest marketing data it could have had. | ✅ The answer is sent as its own labelled line, and the Contact page has a dedicated source picker that sends it directly. |
| 58 | P2 | The repair form's "problem description" is optional. | An enquiry without a description forces a reply before the shop can answer — and every extra round trip loses some enquiries. | ⬜ Deliberate: the field stays optional (a customer with a broken chain should not have to type), the placeholder asks for a short description, and the shop's first reply asks for it. Documented here so the trade-off is a decision, not an accident. |
| 59 | P2 | The form's error summary did not move focus to the first invalid field. | The customer saw "a few details need your attention" on a phone and did not know which box was wrong. | ✅ Focus moves to the first field with `aria-invalid="true"`, and every error is announced. |
| 60 | P3 | The shortlist quantity control allowed nine of the same cycle with no explanation. | Odd quantities look like a mistake and clutter the shop's message. | ⬜ Deliberate: a family buying three of the same model is real; the maximum is 9 and the control is labelled. |

## F · Contact, trust and proof (P1/P2)

| # | Sev | Finding — what is wrong | Why the customer is lost | Status |
| --- | --- | --- | --- | --- |
| 61 | P1 | The About page had **no photographs of the shop**. | "Is this a real shop?" is the first question about an unknown website. No photos read as "not a real shop". | ✅ Six real photographs with Bengali and English captions. |
| 62 | P1 | Twelve genuine shop photographs existed in the repository and **none of them were displayed**. | The strongest trust asset the shop owns was being thrown away. | ✅ Six are wired into the About gallery with `srcset`; the rest are listed for the owner. |
| 63 | P2 | The address could not be copied. | The customer had to hand-type an address into Maps — the point at which many people give up. | ✅ A copy-address button with a spoken confirmation. |
| 64 | P2 | The map was the only way to reach the shop, and it loaded Google on every visit. | Slower first load and a third-party request before the customer saw anything. | ✅ A click-to-load facade shows the address and a "load map" button first. |
| 65 | P2 | The homepage "visit the shop" steps were generic advice, not shop facts. | Nothing proved the shop was worth a trip. | 🟡 The steps are now paired with the real address, hours and phone; 🔴 Owner for a photo of the storefront in the hero. |
| 66 | P2 | The Contact page's "how did you hear about us" buttons looked like outbound links (arrow icons). | The customer did not realise they were choices, so the data was never collected. | ✅ The panel now explains what tapping does and the chosen source is echoed back. |
| 67 | P2 | The contact form's message could be lost if the WhatsApp window was blocked. | Silent loss of a lead. | ✅ The form shows the prepared message and a fallback "open WhatsApp" button. |
| 68 | P2 | The shop's phone number was shown as text in some places and as a tap-to-call link in others. | On a phone, a number that is not a link cannot be called with one tap. | ✅ Every appearance of the number is now a `tel:` link. |
| 69 | P2 | The footer said "© {year} Kanchan Cycle Stores" but never said where the shop is. | The footer is the last thing a customer reads before deciding. | ✅ The footer carries the address, the phone, the hours and the WhatsApp button. |
| 70 | P3 | The Contact page had no "what happens after I send this" explanation. | Uncertainty about the next step is a reason to delay — and delay is loss. | ✅ The form states that nothing is stored by the website and that the message opens in WhatsApp for the customer to send. |
| 71 | P3 | The privacy page promised "no form data is stored", but a visitor could not check it. | Trust claims that cannot be verified read as marketing. | ✅ The privacy page now names exactly what is stored (language choice and the shortlist, in localStorage) and what is not. |
| 72 | P3 | The page titles did not contain the town. | "সাইকেল" in a search result gives a local customer no reason to pick this link over the next one. | ✅ Titles now read "সাইকেল | কাঞ্চন সাইকেল স্টোর্স | কোলাঘাট" and so on. |

## G · Speed on a 3G phone (P1/P2)

| # | Sev | Finding — what is wrong | Why the customer is lost | Status |
| --- | --- | --- | --- | --- |
| 73 | P1 | Catalogue photographs ran up to **257 kB and 1288 px wide**, and the whole `public/images` folder was **3.7 MB**. | On a 3G phone in Kolaghat, the catalogue cost megabytes before a single cycle was visible. Customers wait, or leave. | ✅ `npm run images` generates 400 px and 800 px WebP variants (44 files, ~1.27 MB) and writes `src/config/photoVariants.ts`. |
| 74 | P1 | The homepage hero served a **1600 px JPEG** on desktop. | The first screen of the site — the one that decides whether the visitor stays — waited on the heaviest image on the page. | ✅ A 1200 px WebP hero (80 kB) is served to desktop through a `<picture>` source. |
| 75 | P1 | No `srcset` anywhere: a 390 px phone downloaded the desktop-size photograph. | Four times the data for the same picture. | ✅ `srcset`/`sizes` on every card, product photo, thumbnail and gallery image. |
| 76 | P2 | Static images and icons had **no cache headers**. | Every visit re-downloaded the whole catalogue. | ✅ `/images/*` and `/icons/*` are cached for 7 days with `stale-while-revalidate` in both `vercel.json` and `public/_headers`. |
| 77 | P2 | The service worker's image cache held only 24 entries. | The 22-cycle catalogue plus the hero and the shop photos overflowed it, so photos were evicted and re-downloaded. | ✅ Raised to 80. |
| 78 | P2 | Images had no `width`/`height`, so the page reflowed as they loaded. | Clicks landed on the wrong target, and the page looked broken while loading. | ✅ Explicit dimensions on every image. |
| 79 | P2 | The main bundle is 441 kB (133 kB gzipped). | Slow first load on a weak connection; the customer sees a blank screen. | 🟡 Routes are already code-split (the largest route chunk is 32 kB). Further trimming is possible but is a lower priority than the owner's data. |
| 80 | P2 | The offline page could not show the catalogue. | A customer who opened the site in a spot with no signal got nothing. | 🟡 The service worker now caches images at runtime (80 entries); the catalogue photos themselves are not precached. |
| 81 | P3 | The image-variant manifest had to be written by hand. | A replaced photograph would silently keep its old variants. | ✅ `scripts/generate-image-variants.mjs` regenerates the variants and the manifest together. |
| 82 | P3 | The variant files were not excluded from the repository. | A patchset full of binaries for no reason. | ✅ Generated binaries are committed once; `npm run images` is the documented refresh path. |
| 83 | P3 | The build did not check that every catalogue photograph actually exists on disk. | A missing file is a broken image on a customer's screen, found only in production. | ✅ `scripts/generate-seo.ts` fails the build on an invalid catalogue. |

## H · Accessibility and mobile input (P2/P3)

| # | Sev | Finding — what is wrong | Why the customer is lost | Status |
| --- | --- | --- | --- | --- |
| 84 | P2 | Many `<button>` elements had no explicit `type`. | A button inside a form defaults to `submit`: clicking "clear filters" or "copy link" can submit the form, reload the page and wipe what the customer typed. | ✅ Every button in `src/` now declares `type="button"` or `type="submit"`. |
| 85 | P2 | The results count was not announced to a screen reader. | A customer using voice input or a reader did not know whether the filter had worked. | ✅ `role="status" aria-live="polite"`. |
| 86 | P2 | The image alt text on catalogue cards was empty with no width/height contract. | Screen-reader users got nothing, and the layout jumped. | ✅ Meaningful alt text where the image carries information; decorative images stay empty but now reserve their space. |
| 87 | P2 | The focus was not moved to the new question in the quiz. | A screen-reader user did not know the quiz had moved on. | ✅ The heading takes focus on every step, including "back" and "reset". |
| 88 | P2 | The mobile drawer's close button was not `type="button"`. | Same submit hazard as #84, on the menu. | ✅ Fixed with #84. |
| 89 | P3 | The language switcher announced the current language only visually. | A screen-reader user did not know which language was active. | ✅ `aria-pressed` on both buttons. |
| 90 | P3 | The axe accessibility scan was not run over every page at both widths. | Regressions arrive quietly. | ✅ The Playwright suite scans eight pages at 390 px and 1440 px and fails on any violation. |

## I · Owner tooling and configuration hygiene (P2/P3)

| # | Sev | Finding — what is wrong | Why the customer is lost | Status |
| --- | --- | --- | --- | --- |
| 91 | P1 | There was **no list of what was still missing**. The owner could not see that prices, stock, hours, indexing and the website URL were all unset. | Everything in sections A, B and F stayed broken because nobody could see the list. | ✅ `src/lib/launchReadiness.ts` derives ten checks from the live configuration and renders them as a bilingual blocker panel on `/owner`. |
| 92 | P2 | The stock desk could not be connected to the catalogue the site serves. | The owner can prepare a catalogue but the customers still see empty prices. | 🟡 The desk exports CSV and JSON that can be published to the live catalogue (Supabase); 🔴 Owner to publish it and to enter the first real prices. |
| 93 | P2 | `src/config/shop.ts` and `src/config/cycles.ts` imported each other at runtime. | A circular import is undefined behaviour in some bundlers — the catalogue could have come back empty at random. | ✅ Categories moved to `src/config/categories.ts`; the cycle → shop import is now type-only. |
| 94 | P2 | Nothing recorded whether a photograph was a shop photo or a catalogue picture in the data itself. | The fix for #23 could not be expressed, and the next photographer would repeat the mistake. | ✅ `photoKind` on every product, with `shopPhotos` as the list of the shop's own pictures. |
| 95 | P2 | 52 translation keys were defined in both languages and used nowhere. | Dead copy hides dropped features — and the Bengali and English pages had drifted apart in what they promised. | ✅ bn/en parity is now checked (404 keys each, none missing on either side) and the unused keys were removed or put back to work. |
| 96 | P2 | The build did not verify the phone number, the WhatsApp number or the address format. | A typo in the one number the whole shop depends on would have shipped silently. | ✅ `scripts/generate-seo.ts` hard-fails on an invalid phone or WhatsApp number. |
| 97 | P3 | The security headers were defined twice (`vercel.json` and `public/_headers`) and could drift apart. | A drifted Content-Security-Policy can block the map, the images or the WhatsApp links. | ✅ `npm run security:check` fails the build when the two differ or contain `unsafe-inline`/`unsafe-eval`/wildcards. |
| 98 | P3 | The service worker precached the application shell but not the shop's own data. | An offline visit showed an empty shop. | ✅ The shell, the offline page and the icons are precached and verified by the PWA test. |
| 99 | P3 | The catalogue could be replaced at runtime by a live Supabase catalogue, but the merge behaviour was untested. | A live catalogue that dropped the static entries would empty the shop's pages. | ✅ `mergeCatalog()` keeps the static seed for any id missing from the live catalogue, and is covered by unit tests. |
| 100 | P3 | Nothing in the repository recorded *why* a page looked the way it did, so the next change could undo any of this. | The next person "tidies up" the pending flags and the empty catalogue comes back. | ✅ This document, `OWNER_CHECKLIST.md` and the comments in `src/lib/catalog.ts` and `src/lib/quiz.ts`. |

---

## What only the shop owner can do

Everything on this list is code-complete and waiting for a real answer. In priority order:

1. **Set the production URL and switch indexing on** (`shop.websiteUrl`, `shop.seo.indexingEnabled`) — until this is done, nobody can find the shop on Google and every shared link may point at the wrong origin. *Findings 1, 2, 3.*
2. **Publish prices and stock** for the 22 cycles. *Findings 13, 14.*
3. **Confirm gearing, rider height and specifications** per cycle. *Findings 15, 16, 44.*
4. **Resolve the cycle-05 photo/name mismatch** (Brooks kids ride-on vs. the BSA motorised ride-on in the picture). *Finding 22.*
5. **Confirm the opening hours**, which removes the "subject to confirmation" caveat from every page and adds the structured `openingHours` data. *Finding 26.*
6. **Add the social links and an email address.** *Findings 10, 12.*
7. **Add real, permitted reviews.** *Finding 25.*
8. **Confirm the services that are not yet confirmed** (`puncture`, `brakes`, `chain`, `gears`, `tyres` are all `confirmed: false` today). *Finding 57 and the Services page.*
9. **Add an analytics endpoint** so enquiry sources can finally be measured. *Finding 11.*

Every one of these is a single line in `src/config/shop.ts` (or the `/owner` stock desk). The readiness panel on
`/owner` lists the same items with the same wording, so nothing depends on reading this document.

## What the code now guarantees

* A filter can never empty the catalogue because of unknown data — unknown means "ask the shop", and it is
  shown last, not hidden.
* The customer always has at least one working way to reach the shop: WhatsApp, tap-to-call, or the address
  with directions — from every page, including the empty states.
* Nothing is ever invented: no price, stock, offer, review, opening hour or service is claimed without the
  shop's confirmation, in either language.
* No enquiry data is stored by the website. Only the language choice and the shortlist live in localStorage.

## Verification

| Check | Result |
| --- | --- |
| `npm test` | 8 files, 54 tests — **pass** |
| `npx playwright test` | 22 end-to-end tests — **pass** (catalogue filters, quiz, shortlist, repair form, images, a11y) |
| `npx tsc -b` | **pass** |
| `npm run security:check` | **pass** |
| `npm run build` | **pass** — main JS 442 kB / 133 kB gzip; a phone now downloads one 400 px variant per cycle (24 variants, 375 kB in total, ~15 kB each) instead of a 257 kB original |

Related documents: `OWNER_CHECKLIST.md` (the shop-side tasks), `docs/SALES_PLAYBOOK.md` (how to answer an
enquiry), `docs/SECURITY-CONTROLS.md` (privacy and headers), `docs/ANDROID.md` (install on a phone).
