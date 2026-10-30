# Security notes for the Android-first release

This is a delta against the original 100-control audit in
[`SECURITY_REPORT.md`](../SECURITY_REPORT.md). It records what the Android/PWA
and live-catalogue work added, what it removed, and what still needs a human.

The approach follows the Cloudflare security-audit skill's structure: *enumerate
the attack surface → check each control → state what is untested*. An autonomous
pentest platform (for example PentAGI) is useful later, but only against a
staging deployment with the owner's written permission — not against production
and not against a Vercel preview URL shared by someone else.

## What changed on the attack surface

| Addition | New risk | Mitigation in this repository |
| --- | --- | --- |
| Service worker (`public/sw.js`) | Cache poisoning, serving a stale or injected page | Same-origin only; precache list is fixed; network-first navigations; versioned caches; no `eval`; no cross-origin caching |
| Web app manifest + install prompt | Spoofed install identity, oversized prompts | Icons and names are local; no external icon host; prompt is dismissible and rate-limited on the device |
| Live catalogue (Supabase) | Public data exposure, write abuse | RLS: anon can select `published = true` only; writes require an allowlisted authenticated email; no service key in the bundle |
| Product photo URLs | Tracking pixels, mixed content | HTTPS only, host restricted to the configured Supabase project, no credentials in URL |
| Shortlist in `localStorage` | Personal data leaking between users on a shared phone | Stores product names and quantities only, never name or phone; cleared by the customer |
| `/owner` stock desk | Looks like an admin panel but has no authentication | Explicitly documented as device-local and not secure; no network writes; `noindex`; not in navigation |
| n8n workflows | Service-role key leakage, exposed editor | Key only in n8n env/credentials; repository contains expressions, not values; `sb_secret_` patterns are blocked by `security:check` |

## Controls verified automatically

`npm run build && npm run security:check` now checks, in addition to the original
header/inline-script/secret checks:

- `manifest-src 'self'` and `worker-src 'self'` are present (without them the
  install prompt and service worker are silently blocked).
- No `unsafe-inline`, `unsafe-eval` or `https://*` in the CSP.
- `index.html` links the manifest; the manifest has regular and maskable icons;
  the display mode is `standalone`.
- The service worker restricts caching to the site's own origin.
- The offline page contains a working `tel:` link.
- If `VITE_SUPABASE_URL` is set, the exact project host appears in `connect-src`
  and `img-src` — the build fails instead of shipping a broken or over-broad CSP.
- No private keys, GitHub tokens, AWS keys or Supabase secret keys in tracked files.
- `vercel.json` and `public/_headers` describe the *same* policy. A host reads only
  one of them, so before this check a header could be tightened in one file and
  silently left weak in the other.
- `Cross-Origin-Resource-Policy: same-origin` is present, so other sites cannot
  embed this site's images or scripts as subresources.

## Automated scanning: dependencies, secrets, code

None of these can be enabled from a file alone; each needs one owner click or a
merged workflow. This is what is committed and what remains.

| Capability | Committed here | Still needs the owner |
| --- | --- | --- |
| Dependency CVEs | `npm audit --audit-level=moderate` in CI, weekly schedule | — |
| Dependency updates | `.github/dependabot.yml`: npm + GitHub Actions, weekly, grouped PRs | Enable **Dependabot alerts** in Settings → Code security; confirm the first PR arrives |
| SAST / code scanning | `.github/workflows/codeql.yml`: CodeQL `security-and-quality`, JS/TS, every PR + weekly | Check Security → Code scanning after the first `main` run; triage findings |
| Secret scanning | `security:check` regex scan of tracked files (private keys, `ghp_`, `AKIA`, `sb_secret_`) | Enable **Secret scanning** and **Push protection** in Settings → Code security; rotate anything found |
| Action supply chain | Every `uses:` pinned to a commit SHA; Dependabot keeps pins current | Review Dependabot PRs rather than auto-merging them |
| Production headers | `npm run security:headers -- https://DOMAIN` compares live responses to `vercel.json` | Run it after each deploy; add `--require-hsts` once HSTS is on |

Run the live check manually or from **Actions → Live header verification**. It is
the only control that tests production rather than intent, because GitHub Pages
serves none of these headers no matter what the repository says.

### Staged HSTS rollout

HSTS stays off until every intended hostname answers on HTTPS (control #47). When
that is true:

1. Add `Strict-Transport-Security: max-age=300` to `vercel.json` and
   `public/_headers` (both, or the drift check fails — by design).
2. Deploy, then run `npm run security:headers -- https://DOMAIN --require-hsts`.
3. After a week with no HTTP-only client complaints, raise to `max-age=31536000`.
4. Only after confirming no other subdomain needs plain HTTP, add
   `includeSubDomains`; add `preload` only if the owner accepts the removal cost,
   which is months.

Never enable HSTS as a repo change you cannot undo quickly: browsers honour it
before they ever see the new config.

## Manual checks still required before launch

1. **Real-device install and offline test** on Android Chrome (see
   [`ANDROID.md`](ANDROID.md)). Cache behaviour cannot be proven in CI.
2. **Supabase RLS test as the anon key**: confirm unpublished rows return `[]`
   and that an `insert` returns 401/403.
3. **Owner account hygiene**: unique password, 2FA on the Supabase account and on
   GitHub, and the owner's email removed from `owner_allowlist` if the account
   changes hands.
4. **Hosting headers**: `vercel.json` and `public/_headers` must match the host
   actually used. GitHub Pages applies neither — it cannot set a CSP, so treat a
   GitHub Pages deployment as a preview, not the production site.
5. **WhatsApp link safety**: the site opens `wa.me` in a new tab with
   `noopener noreferrer`; no customer data is placed in a URL fragment.
6. **Third-party review**: Google Maps is the only embedded third party, and it
   loads only when the visitor taps “load map”.
7. **Dependency review**: `npm audit --omit=dev` before each release; the runtime
   dependencies are React, React Router, Lucide and two self-hosted fonts.
   Dependabot proposes updates weekly — read the diff before merging, and never
   batch a major bump with unrelated work.
8. **Code scanning triage**: after the first CodeQL run on `main`, dismiss findings
   with a written reason or fix them; an unread alert queue is the same as none.
9. **Backups**: export the `products` table and keep a copy outside the repo.
   Never commit customer exports (`*.csv` of personal data) — see `.gitignore`.

## Deliberate non-goals

- No login for customers, so no password reset, session fixation or account
  takeover surface.
- No payment processing, so no PCI scope and no card data.
- No server of our own, so no API keys to rotate and no database to patch.
- No analytics by default, so no cookie banner and no third-party tracking.
- No push notifications, so no notification permission prompt to misuse.

## Residual risk

- The owner's phone is now a catalogue-editing device. If it is lost while a
  Supabase session is active, rotate the password and revoke sessions.
- The `/owner` page can be opened by anyone who guesses the URL. It cannot read or
  write server data, but it can reveal the site's draft format. Do not use it on a
  shared or public device.
- A service worker is powerful by design. Keep `sw.js` small, review every change,
  and never add a `fetch` handler that forwards requests to a third party.
- The site's honesty rules are enforced by code and tests, not by the backend:
  a determined owner could still publish a wrong price. Only process and habit
  prevent that.

Report a problem to the shop owner directly; there is no public bug bounty.
