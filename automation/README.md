# Automation (n8n, optional)

Three importable workflows that turn the catalogue into a reliable daily habit.
They run **outside** the website, so a failed automation can never break the shop
page, and the website never needs a secret key.

| File | Trigger | What it does |
| --- | --- | --- |
| `n8n/daily-stock-watch.json` | Every day, 9:00 | Lists products that are out of stock, have no stock value, or have no price. Sends Telegram + email only when something needs attention. |
| `n8n/weekly-catalogue-health.json` | Every Monday, 10:00 | Weekly report: stale products, missing photos, missing prices, counts by category. |
| `n8n/whatsapp-stock-post.json` | Manual | Builds a Bengali WhatsApp status / Google Post text from today's in-stock products. Sends nothing. |

## Setup

1. Import: **n8n → Workflows → Import from File**.
2. Set these environment variables on the n8n host
   (or replace the `$env.*` expressions with n8n credentials):

   ```bash
   SUPABASE_URL=https://YOURPROJECT.supabase.co
   SUPABASE_SERVICE_KEY=...   # server-side only, never in the website
   TELEGRAM_CHAT_ID=...
   SHOP_ALERT_FROM=alerts@yourdomain
   SHOP_ALERT_TO=owner@yourdomain
   ```

   `SUPABASE_SERVICE_KEY` is the **service_role** key. It must live only in n8n,
   never in this repository, never in the browser, and never in a public screenshot.
   The workflows only read, so you can also create a dedicated read-only Postgres
   role and use that instead.

   n8n 1.x blocks `$env` in code nodes by default. If expressions resolve to
   empty, set `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` on your own instance, or
   switch the HTTP Request node to a Header Auth credential.

3. Credentials: connect Telegram, and an SMTP account for the email nodes. Delete
   whichever notification branch you will not use.
4. Run **Execute Workflow** once with real data. Check the message reads correctly
   in Bengali before activating the schedule.
5. Activate the first two workflows. Keep the stock-post one manual.

## Why these three

- **Stock accuracy is the sales lever.** A customer who sees “in stock” and finds
  nothing on the shelf does not come back.
- **Nothing is invented.** The workflows only report what is missing; they never
  guess a price, a stock level or a discount.
- **The owner's phone is the control surface.** If n8n is down, the website still
  works. If Supabase is down, the website falls back to the cached catalogue.

## Suggested flow with WhatsApp

n8n can send WhatsApp messages through the WhatsApp Cloud API, but every business-
initiated message needs a pre-approved template. Until those templates exist:

1. Let the workflow write the message (as the stock-post workflow does).
2. Copy it into WhatsApp Business → Status, or a broadcast list.
3. Keep transactional replies (prices, directions, repair slots) manual. A named
   reply from a person beats an automated one for a shop this size.

## Security notes

- Store credentials only in n8n's credential store.
- Restrict the n8n editor with a strong password and 2FA, and do not expose the
  editor to the public internet without a proxy.
- The workflows use HTTPS only and read published data. If you add a write
  workflow (for example, importing a supplier price list), test it on a copy of
  the table first and keep `published = false` until the owner has reviewed it.
- Back up the `products` table before any bulk import.
