# Website security controls

Reviewed 31 October 2026. This is an implementation map for the current Kanchan
Cycle Stores site, not a penetration-test result or a claim that the site is
unhackable.

## Architecture and honest limits

The public website is a static React/Vite application. It has no customer account,
password form, booking/payment endpoint or server that stores enquiries. Contact
and repair forms validate locally and open a user-approved WhatsApp message. The
optional Supabase integration is a public, read-only catalogue in this website;
Supabase Storage is configured separately for product photographs. Public database
roles receive column-level SELECT grants only for catalogue fields (plus published
and ordering fields needed for filtering), so new table columns are not public by
default. `/owner` is a
public, device-local draft tool, **not an authenticated admin panel**. Anyone who
opens that path can use its local UI, but it has no browser write API.

That architecture means some controls cannot be installed in frontend code. In
particular, client-side throttles cannot stop scripts, direct HTTP requests or
abuse of the shop's public WhatsApp number. True request-rate controls belong at
the service receiving the request (Supabase/host/CDN); production host settings
must be configured and verified by the owner.

## Requested controls

| Control | What is implemented for this site | Scope / remaining action |
|---|---|---|
| **1. Rate limiting** | Contact form disables repeat submission of the same unchanged message; the repair form transitions to a confirmation view after submit. Supabase catalogue requests have a fixed 500-row cap and are cached locally. | These are accidental-repeat/resource bounds, **not server-side rate limiting**. The site has no form API to protect. WhatsApp is external and can still receive unwanted messages. Enable host/CDN or Supabase edge limits if traffic abuse occurs; add server-side rate limits before introducing a submission endpoint. |
| **2. Input validation** | Repair/contact inputs have runtime type checks, strict length bounds, control-character checks, dates/times and allowlisted select values. Quiz numbers and shortlist free text are bounded. Stock drafts and JSON import are schema/enum/length checked. Catalogue rows and photo URLs are normalized before rendering. React renders values as escaped text. | Browser checks are usability/defence-in-depth; every future server write must validate again at the server/DB. |
| **3. Authentication is not authorization** | The public site has no login or protected admin route. `/owner` clearly states that it is not secure. In the optional Supabase schema, an authenticated identity is not enough: RLS checks a private owner-email allowlist and requires an MFA-authenticated `aal2` token for owner access/writes. The allowlist is not readable by browser roles. Table grants are narrower than the RLS rules. | Re-run `supabase/schema.sql` in an existing project, enroll the owner in MFA, disable public sign-up if unused, and test reads/writes with anon, non-owner, AAL1 and allowlisted AAL2 accounts. The Supabase dashboard itself must use its own account controls. |
| **4. Secret management** | `.env*`, private key files and database exports are ignored. Build-time checks reject a Supabase service-role/secret key in `VITE_SUPABASE_ANON_KEY` and scan source plus built public files. | Every `VITE_*` value is public in the browser bundle. Only a public anon/publishable Supabase key belongs there. Store service credentials only in a server/hosting secret manager; rotate any key that was exposed. |
| **5. File upload security** | `/owner` only reads a user-selected local `.json` draft file; it does not upload it. It refuses files over 1 MiB, caps drafts at 500, bounds fields before parsing/validation and shows generic errors. The optional Supabase photo bucket is limited to 2 MiB JPEG/PNG/WebP, with matching extension/MIME and owner-only AAL2 write policies. | There is no malware scanner or image re-encoder. Upload only trusted shop photos. The Supabase SQL updates restrictions on an existing bucket; re-run it after changing the schema. |
| **6. Error handling / information leakage** | Route errors show a generic recovery page. Component stacks are logged only in local development; production does not send error details to a third party. Catalogue and file-import failures are not rendered with raw server/error text. | Production headers and host error pages must still be checked on the deployed site. Do not add customer messages or phone numbers to logs/analytics. |
| **7. Server-side template injection** | Not applicable: there is no server-side template engine or SSR. User text is rendered through React; the source check rejects `dangerouslySetInnerHTML`, `innerHTML`, `eval` and `new Function`. JSON-LD is serialized as JSON and assigned with `textContent`. | If SSR, HTML templates or a CMS are added, re-review every untrusted value and use contextual escaping; never evaluate input as a template. |
| **8. ReDoS** | Validation checks maximum lengths before trimming, normalization or regex work; all form regexes are fixed, simple patterns. Cached catalogue, shortlist and owner-import strings are bounded before `JSON.parse`. Tests exercise multi-megabyte values. | Keep new regexes linear-time and inputs bounded before matching. A slow regex in a browser can still freeze that visitor's tab. |
| **9. Long-password DoS** | Not applicable to the website: it has no password field, password hashing or customer account. Supabase handles its own hosted authentication. | Keep owner authentication at Supabase; use MFA, disable unused sign-up, and configure password/session policy in the provider. Do not implement password hashing in frontend JavaScript. |
| **10. Secret-key leaks** | The build blocks `sb_secret_`-style keys, private keys, GitHub/AWS token patterns and decoded Supabase JWTs with `role=service_role` in source or `dist`. `npm run build` runs this check before it succeeds. | Repository regex checks are not a historical secret scan. Enable GitHub secret scanning/push protection; rotate a secret immediately if found in Git history or a deployment. |
| **11. No SQL / SQL injection** | The storefront sends only a fixed Supabase REST `GET`, with an explicit public-column allowlist and `URLSearchParams`-encoded fixed filters. It issues no SQL and no writes. The optional SQL schema uses fixed statements, grants/RLS and unique constraints; no user string is interpolated into SQL. | Test Supabase RLS against the live project. Do not add a service-role key or direct SQL endpoint to the browser. |
| **12. Clipboard attacks** | There are no clipboard reads or automatic paste handlers. Sharing/copying uses `navigator.share` or `navigator.clipboard.writeText` only after a user clicks, with plain text. The owner CSV copy is also explicit. | Treat imported owner drafts as untrusted; bounds/validation apply before they can be copied. Never add clipboard reads or silently replace clipboard contents. |
| **13. Replay attacks** | No customer state-changing HTTP endpoint, payment, booking or session exists in the site. The browser's catalogue request is read-only `GET`; product IDs/slugs are unique. | Owner operations are managed by Supabase. Protect sessions/tokens with MFA, HTTPS, provider expiry/revocation and audit logs. If orders/payments are added, use server-side authorization, idempotency keys/nonces and replay tests. |

## Additional controls

- Production CSP, frame restrictions, MIME sniffing, referrer/permissions policy,
  COOP/CORP, and cache headers are configured in `vercel.json` and `public/_headers`.
  GitHub Pages ignores these files, so the actual host must be header-capable or
  have an equivalent CDN policy.
- The service worker caches same-origin GET assets only; it never caches form
  content or customer data.
- npm dependency audit, CodeQL, Dependabot and secret checks run in CI. Review
  updates rather than auto-merging them.
- HTTPS, HSTS, CDN/WAF rate limits, repository protection, MFA on GitHub/hosting,
  and production header verification require owner/deployment settings and are
  not proven by a successful local build.

## Verification

```bash
npm run check                 # tests, production build, and security checks
npm audit --audit-level=moderate
npm run security:headers -- https://YOUR-DOMAIN
```

`npm run security:headers` checks a live response. Run it after deploying; a local
pass only proves the repository's requested policy is internally consistent.
