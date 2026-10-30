# Photographs on this website

## Only the owner's own photograph is used

The site is deliberately image-light. The **only** photograph anywhere on the website is the
owner's own portrait, taken inside the shop in Kolaghat and supplied by the owner. There are no
stock photographs, no AI-generated images and no product images.

| Asset | Where it appears | What it shows (caption) |
|---|---|---|
| `public/images/kanchan-store-hero.jpeg` (1024 × 1536) | Homepage hero — full-bleed background behind the whole first screen (the caption floats over it); also the Open Graph / social preview image | The shopkeeper inside Kanchan Cycle Stores in Kolaghat |

The portrait is loaded eagerly because it is now the first thing a visitor sees. It is the only
`<img>` on the homepage, so `tests/e2e/website.spec.ts` still expects exactly one photograph
(`/images/kanchan-store-hero.jpeg`) on `/` and none on any other route. The small signature line
under the homepage shop story reuses the same caption as text, not as a second image.

## Rules kept in this project

- Every photograph is described as **দোকানের ছবি / Shop photo**; none is labelled as a catalogue product.
- A product never gets an image. Product cards, category cards and service cards are text-only by design.
- Captions describe only what is visible in the frame; no stock model is presented as shop inventory.
- Photographs of shop interiors are illustrative of the shop, not a stock list. The site says so:
  "ছবিতে থাকা মডেল বা রং সবসময় স্টকে নাও থাকতে পারে" / "Models or colours in these photos may not
  always be in stock."

## Replacing or adding a photograph

1. Export a portrait JPEG at 1024 × 1536 (2:3) — the hero background crops with `object-position: 50% 26%`
   on desktop and lifts the backdrop above the fold on phones, so keep the face in the upper third and
   leave headroom above the hair.
2. Replace `public/images/kanchan-store-hero.jpeg` (keep the file name; the config, Open Graph tags and
   tests all point at it).
3. Update `shop.heroPhoto` in `src/config/shop.ts` if the dimensions or the bilingual `alt` and
   `caption` change.
4. Add no second photograph: the automated test in `tests/e2e/website.spec.ts` fails if any page
   requests an image other than `/images/kanchan-store-hero.jpeg`, or more than one on `/`.

## Rights

The photographs were supplied by the shop owner for use on this website. Trademarks visible in the
frames (for example Hercules, BSA, Hero Sprint, Stryder) belong to their respective owners and are
shown only as they appear in the shop.
