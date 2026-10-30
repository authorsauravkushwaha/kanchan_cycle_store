# Photographs on this website

## Only the owner's own photographs are used

The site is deliberately image-light. The **only** photographs anywhere on the website are the
ten photographs of the shop in Kolaghat supplied by the owner on 29 October 2026. There are no
stock photographs, no AI-generated images, no illustrations and no product images.

| Asset | Where it appears | What it shows (caption) |
|---|---|---|
| `storefront.webp`, `storefront-480.webp` | Home hero, About gallery reference | The shop steps and signboard on Kolaghat - Jashar Road |
| `bicycle-display.webp`, `-400.webp` | Home "our shop" strip, About gallery | New cycles lined up at the shop entrance |
| `showroom-row.webp`, `-400.webp` | Home "our shop" strip, About gallery | Rows of cycles inside the showroom |
| `kids-and-city.webp`, `-400.webp` | About gallery | Kids' and everyday city cycles along the wall |
| `stryder-corner.webp`, `-400.webp` | About gallery | A Stryder kids' cycle on display |
| `workshop.webp`, `-400.webp` | About gallery | The repair workshop, tools and spare parts |
| `hero-sprint-board.webp`, `-400.webp` | About gallery | The shop's signboard facing the road |

All files live in `public/images/shop/`. The 400–480 px variants are used on narrow screens.

## Rules kept in this project

- Every photograph is described as **দোকানের ছবি / Shop photo**; none is labelled as a catalogue product.
- A product never gets an image. Product cards, category cards and service cards are text-only by design.
- Captions describe only what is visible in the frame; no stock model is presented as shop inventory.
- Photographs of shop interiors are illustrative of the shop, not a stock list. The site says so:
  "ছবিতে থাকা মডেল বা রং সবসময় স্টকে নাও থাকতে পারে" / "Models or colours in these photos may not
  always be in stock."

## Replacing or adding a photograph

1. Export a WebP at the largest size you need (hero: 960 × 1200; gallery: 800 × 600) plus a
   small variant (hero: 480 × 600; gallery: 400 × 300). Keep the 4:5 (hero) and 4:3 (gallery) crops.
2. Put both files in `public/images/shop/`.
3. Update the matching entry in `shopPhotos` in `src/config/shop.ts`: `src`, `smallSrc`,
   `smallWidth`, `width`, `height`, bilingual `alt` and `caption`.
4. Hero: `shop.heroPhoto`. Gallery order: `shop.gallery`.

Delete photographs you remove from both the folder and the config — the site never shows a broken
image, and the automated test in `tests/e2e/website.spec.ts` fails if any image outside
`/images/shop/` is requested.

## Rights

The photographs were supplied by the shop owner for use on this website. Trademarks visible in the
frames (for example Hercules, BSA, Hero Sprint, Stryder) belong to their respective owners and are
shown only as they appear in the shop.
