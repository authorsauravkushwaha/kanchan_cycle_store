# Sales playbook for a phone-first cycle shop

The website cannot sell a bicycle by itself. What it can do is remove every
reason a customer on Google Maps hesitates: is it open, is the stock real, how
much is it, can I ask without calling, where exactly is it.

This playbook is about using the site you now have. It contains no invented
discounts, ratings or claims, because those are the fastest way to lose a
neighbourhood customer's trust.

## Where customers actually come from

For a shop like this, the order is usually:

1. **Google Maps / Google Search** — “cycle shop near me”, “সাইকেলের দোকান কোলাঘাট”.
2. **Word of mouth** — a neighbour, a school parent, a repair customer.
3. **WhatsApp** — forwarded number, status update, a friend's message.
4. **The website** — almost always opened from the Maps listing, on a phone.

So the website's job is to convert a Maps tap into a call, a WhatsApp message, or
a visit. That is why the first screen has WhatsApp and directions, why the bottom
bar never scrolls away, and why arriving with `?utm_source=google-maps` shows
“You're here — call or get directions” above everything else.

## 1. Fix the Google Business Profile first (highest return)

The website cannot outrank a wrong map pin. Do this once, carefully:

- Claim/verify the listing for **Kanchan Cycle Stores, Kolaghat**.
- Exact name, phone `+91 70768 84950`, address, category **Bicycle Shop**, and
  **Bicycle Repair Shop** as a secondary category.
- Set the same opening hours everywhere — website, Maps, WhatsApp — and keep them
  correct during festivals. Then ask us to set `hours.confirmed: true` so the
  website can publish them as structured data.
- Add the website URL to the listing. This is what makes the site discoverable
  from Maps at all.
- Upload **fresh real photos every week**: storefront, new arrivals, the workshop,
  a repair in progress. Google rewards active listings; customers trust recent
  photos more than any headline.
- Use **Posts** for the weekly stock list: the n8n “WhatsApp stock post” workflow
  in `automation/` writes it in Bengali for you.
- Turn on messaging only if you can answer within an hour. A dead chat is worse
  than no chat.

## 2. Make WhatsApp the shop counter

- WhatsApp Business profile: real shop name, the same photo as Maps, hours,
  address, and a **catalogue** with 10–20 real products.
- Set a greeting message and three quick replies:
  - “দাম কত?” → send the price, stock and “দোকানে এসে দেখে নিতে পারেন”.
  - “পথ?” → send the Maps pin.
  - “মেরামত?” → ask for the problem and preferred time.
- Use **labels** in WhatsApp Business: `new enquiry`, `visited`, `bought`,
  `service due`. At the end of the month you can see which channel produced sales.
- The website's shortlist arrives as one tidy itemised message. Reply with a real
  total and a “hold this for you until tomorrow evening?” — a soft hold converts
  well and costs nothing.
- Never quote a price you have not checked. The site shows “ask the shop” for a
  reason; a wrong WhatsApp price is remembered for years.

## 3. Use the website as a shop assistant

- **Shortlist:** when a family is comparing three cycles, tell them to tap “তালিকায়
  রাখুন” on each one. They arrive at the counter with a list on their phone. It
  also gives you a reason to follow up the next day.
- **Recommendation steps:** six questions (rider, age, height, budget, use, gears).
  It is deliberately conservative — use the answers as a starting point, not as a
  verdict. Ask the child to sit on the cycle.
- **Repair enquiry:** the form formats the name, number, cycle type, date, time
  and problem into one message. Reply with a time slot and a price range.
- **Installed app:** ask regulars to “Add to Home screen”. Their next visit is one
  tap, and the shop is on their phone next to WhatsApp.
- **Share button:** for a happy customer, one tap sends the site to a family
  WhatsApp group. This is the cheapest marketing the shop has.

## 4. The 30-day plan

| Week | Do |
| --- | --- |
| 1 | Verify Google Business Profile; add the website URL; upload 10 real photos; confirm hours everywhere; add 10 real products (with prices you have checked) to the site via `/owner` + Supabase, or ask for them to be added to `shop.catalog`. |
| 2 | Set up WhatsApp Business catalogue and quick replies. Put a small “Scan / visit our website” card at the counter with the site address. Add the install nudge to your bill pad: “হোম স্ক্রিনে রাখুন”. |
| 3 | Start asking every buyer for a Google review — in person, at handover, with the phone already open. Reply to every review, including the bad ones, without arguing. Post the weekly stock list to Google Posts and WhatsApp status. |
| 4 | Review WhatsApp labels: how many enquiries, how many visits, how many sales. Note which products get asked about but are never in stock — that is your next purchase list. |

## 5. Seasonal rhythm in Kolaghat

Plan stock and posts around local demand rather than generic “sale” banners:

- **School admission season (Dec–Jan):** student cycles, height fitting, parents
  comparing two models. Post a “which size for which class” explainer.
- **Durga Puja / Vishwakarma Puja:** service rush before the holidays; offer a
  service slot booking message, not a discount.
- **Summer holidays:** kids' cycles, helmets, bells.
- **Monsoon:** brakes, tyres, chain care, mudguards.
- **Winter:** commuting and fitness riders, lights and locks.

A small, true statement beats a large, invented one: “ব্রেক চেক করে দিচ্ছি — আসার
আগে মেসেজ করুন” is honest and it fills the workshop.

## 6. Reviews and referrals, without tricks

- Ask at the moment of handover, not by email three days later.
- Never write reviews for customers, never buy them, never offer a discount for a
  five-star rating. It violates Google's policy and customers can tell.
- The site only shows a review if it has a real public URL and recorded
  permission (`shop.reviews`). Until then it invites a conversation instead.
- A simple referral line that works: “আপনার পাড়ায় কেউ সাইকেল খুঁজলে আমাদের নাম
  বলবেন।”

## 7. What to measure (and what not to)

No analytics are enabled by default. The two numbers that matter can be counted
by hand:

- **WhatsApp enquiries per week** (labels in WhatsApp Business).
- **Visits per week that mention the website or shortlist.**

If you later enable the optional analytics endpoint (see `README.md`), it records
only event names such as `whatsapp_click`, `shortlist_share` and
`directions_click`, never names or phone numbers. Do not add a tracking pixel that
sends customer data to a third party without a privacy notice — the current
`/privacy` page describes exactly what happens today.

## 8. Things this website will not do

- Invent prices, discounts, ratings or “years of experience”.
- Promise a repair price before seeing the cycle.
- Publish unconfirmed opening hours as official data.
- Show stock photos of bicycles you do not have.
- Take card payments online. Payment links, if ever added, need a separate
  security and refund policy.

Keeping those promises is why the site can be trusted when it says “স্টকে আছে”.
