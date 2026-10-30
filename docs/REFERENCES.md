# Which reference project influenced what

Seven repositories were suggested as inspiration. This page records what was
actually used, what was deliberately not used, and why — so nobody assumes a
dependency that does not exist.

| Project | Used here? | How, or why not |
| --- | --- | --- |
| [supabase/supabase](https://github.com/supabase/supabase) | **Yes — optional backend** | `supabase/schema.sql` is a small, RLS-first catalogue: public read of published rows, owner-only writes via an email allowlist, a public photo bucket. The website talks to the REST endpoint directly, with no SDK, so the Android bundle stays small and there is no service key in the browser. Setup: [SUPABASE.md](SUPABASE.md). |
| [n8n-io/n8n](https://github.com/n8n-io/n8n) | **Yes — optional automation** | Three importable workflows in `automation/n8n/`: daily stock watch, weekly catalogue health and a Bengali WhatsApp stock-post generator. They run outside the site so a failed automation cannot break the shop page. Setup: [../automation/README.md](../automation/README.md). |
| [appwrite/appwrite](https://github.com/appwrite/appwrite) | **Considered alternative** | Appwrite could replace Supabase with document-level permissions. Only `productFromRow()` and one fetch call are backend-specific, so switching is a contained change. Supabase was chosen for its table editor and CSV import, which a shop owner can use from a phone. Notes: [SUPABASE.md](SUPABASE.md#appwrite-neon-airtable-instead). |
| [vxcontrol/pentagi](https://github.com/vxcontrol/pentagi) | **Not run** | PentAGI is an autonomous pentest platform. Running it needs a staging deployment and written permission; an agent must not scan third-party infrastructure. The audit structure in [SECURITY-NOTES.md](SECURITY-NOTES.md) explains where such a test would fit after launch. |
| [666ghj/MiroFish](https://github.com/666ghj/MiroFish) | **Not used** | It is a multi-agent prediction/simulation project. This shop has no sales history yet, so any “forecast” would be fiction — the same reason the catalogue contains no invented prices or ratings. Once the owner has a few months of WhatsApp label data, a simple seasonal stock plan in [SALES_PLAYBOOK.md](SALES_PLAYBOOK.md#5-seasonal-rhythm-in-kolaghat) is more useful than a simulation. |
| [yuliskov/SharedModules](https://github.com/yuliskov/SharedModules) | **Pattern only** | A shared Android module library assumes a native Gradle app. The requirement here is “runs on Android for phone users arriving from Google Maps”, which a PWA satisfies with zero install friction and one codebase. The same idea — shared, reusable modules — appears as the provider/pure-library split (`src/lib/*` has no React, and is unit-tested). If a native app is ever needed, [ANDROID.md](ANDROID.md) covers the Trusted Web Activity route first. |
| [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) | **Method used** | Its approach — enumerate the attack surface, check each control, state what is untested — shaped [SECURITY-NOTES.md](SECURITY-NOTES.md) and the new automated checks in `scripts/security-check.mjs` (CSP for `manifest-src`/`worker-src`, service-worker scope, Supabase host allowlisting, secret patterns). |

## Rules that stayed constant

- No invented products, prices, stock, ratings, warranties or years in business.
- No third-party requests before the visitor asks for them (the Google map is
  click-to-load; there is no analytics by default).
- No customer database. Enquiries go to WhatsApp; the shortlist stays on the
  customer's phone.
- The owner's name, phone number and address are the only business facts used,
  exactly as supplied.
