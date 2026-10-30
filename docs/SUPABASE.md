# Live catalogue with Supabase (optional)

The website works with no backend: it builds the catalogue from `src/config/shop.ts`
and works offline. Supabase is for the day the owner wants to **change stock and
prices from the phone, without rebuilding the site**.

You do not need Supabase to launch. You do need it before you can say “in stock
today” and mean it every day.

```
Owner's phone ──► Supabase (products table) ──► website (read-only anon key)
                        ▲
                        └── owner stock desk CSV, or the Supabase table editor
```

## What it does and does not do

| Does | Does not |
| --- | --- |
| Serves published products to every visitor | Take payments or orders |
| Lets the owner edit products from a phone | Store customer names, phone numbers or enquiries |
| Keeps the last good catalogue on the phone | Let the browser write to the database |
| Enforces “published only” with row-level security | Publish unverified prices — `NULL` stays “ask the shop” |

Enquiries still go to WhatsApp, exactly as before. There is no customer database
in this project, so there is nothing to leak.

## One-time setup (about 15 minutes)

1. Create a project at <https://supabase.com>. Choose the **Mumbai (ap-south-1)**
   region — the shop's visitors are in West Bengal.
2. Open **SQL Editor → New query**, paste all of `supabase/schema.sql`, press **Run**.
3. In **Authentication → Users**, create one user for the owner (email + password,
   or a magic link). Copy that exact email.
4. Back in the SQL editor, add that email to the allowlist:
   ```sql
   insert into public.owner_allowlist (email, note)
   values ('owner@example.com', 'Shop owner')
   on conflict (email) do nothing;
   ```
   Without this row the owner can read the dashboard but cannot edit products
   through the API. Row-level security is on for every table.
5. In **Project Settings → API**, copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`
   Never put the **service_role** key in the website. It bypasses every rule.

## Add products

**Fast path (phone):** open `/owner` on your phone, add each cycle, then
**CSV** → in Supabase open **Table Editor → products → Import data from CSV**.
The CSV columns already match the table. Set `published` to `true` for the rows
you are ready to show.

**Dashboard path:** add rows directly in **Table Editor**. Only set a price when
you have checked it. Leave `availability` empty if you are not sure — the site
shows “stock to confirm” rather than guessing.

**Photos:** upload the shop's own photographs to the `product-photos` bucket
(public read, owner-only write, 2 MB limit), then paste the public URL into
`photo_url`. Use real photographs of the actual bicycle, never a stock image.

The website reads the table immediately; publish a change by flipping
`published` (or just edit a published row).

## Configure the website

Set the two environment variables in the host (Vercel → Settings → Environment
Variables) or a local `.env` file:

```bash
VITE_SUPABASE_URL=https://YOURPROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Then **replace** the CSP hosts with your exact project host. Wildcards are
deliberately rejected by `npm run security:check`.

`vercel.json` and `public/_headers`:

```text
connect-src 'self' https://YOURPROJECT.supabase.co;
img-src 'self' data: https://YOURPROJECT.supabase.co;
```

Rebuild. If you forget, the build fails with a message naming the host you must
add — it never silently breaks the catalogue.

## Check it works

```bash
npm run build && npm run preview
```

1. Open `/cycles`. A published product should appear.
2. Turn off mobile data and reload. The last catalogue stays visible with a
   “saved catalogue” note.
3. Open `/owner`, change a price, export CSV, import it, publish it.
4. Confirm the public site shows the new price after a refresh.

## Limits and care

- The free tier is enough for a shop of this size (500 MB database, 5 GB egress).
- Keep the number of published rows under a few hundred; the site fetches at most
  500 and caches them on the device.
- Back up the table monthly: **Table Editor → Export → CSV**, store it privately.
  `*.csv` exports of customer data must never be committed (see `.gitignore`).
- If the project is paused for inactivity on the free tier, the website simply
  falls back to the static catalogue and cached data. Nothing breaks.
- Deleting a product removes it from the site; a visitor's saved shortlist may
  still mention it. That is why the shortlist message asks the shop to confirm.

## Appwrite, Neon, Airtable instead?

Only two things are Supabase-specific: the REST query in `src/lib/inventory.ts`
and `supabase/schema.sql`. `productFromRow()` is a pure function with tests, so
another backend only needs to return rows in the same shape. Appwrite would use
its Databases API plus document-level permissions; the website code would change
one fetch call. Keep the same rules: public read of published rows, owner-only
write, no service key in the browser.

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Empty catalogue | No `published = true` rows, or RLS blocked the read | Check the SQL `select` as anon; publish rows |
| Works locally, blocked in production | CSP missing the exact host | Edit `vercel.json` + `public/_headers`, rebuild |
| Old stock on a phone | Service worker served the cached page | Pull to refresh; the SW updates on the next visit |
| Owner cannot save | Email not in `owner_allowlist` | Insert the email, sign in again |
| Photo missing | URL not HTTPS, or a different host | Re-upload to `product-photos`, use that URL |
