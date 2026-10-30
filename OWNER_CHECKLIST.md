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
