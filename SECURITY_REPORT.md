# Kanchan Cycle Stores — security audit and deployment runbook

Audit date: 2026-10-30. Scope: this repository and local build; **no production penetration test or domain/TLS check** was performed. This is a static Vite/React/TypeScript site. It has no backend, database, login, admin interface, payment flow, file upload, or server-side form endpoint. The only enquiry submission is a user-initiated WhatsApp link to **917076884950**; no enquiry is stored by this site. Google Maps is loaded only after a click. Fonts are bundled locally. Optional analytics is disabled (`endpoint: null`). GitHub Pages deployment is present; a Vercel configuration also exists. No website is unhackable.

**Status key:** PASS = code/config implemented and locally tested; PARTIAL = configured but requires deployment/owner verification; FAIL = risk remains without an available mitigation; N/A = no relevant attack surface. PASS for a Vercel header means the configuration passed local checks, **not** that production headers were observed. Evidence: `npm ci --ignore-scripts`, `npm audit --audit-level=moderate`, `npm run check`, `npm run security:check`, manual source review, and GitHub API query. Local tests are not substitutes for production validation. Playwright E2E: 11/11 passed (local Vite preview; not live-host header testing).

## 100-control register

Each row names the control, why it matters, status, and evidence or required action. Rows in the same category share an attack surface, but statuses are independent.

### 1. Authentication and access control
| # | Control / reason | Status and evidence or action |
|---|---|---|
| 1 | No fake customer login / avoid new attack surface | PASS — source review: no auth or admin routes. |
| 2 | Admin MFA / resist credential theft | N/A — no site admin; GitHub MFA is #7. |
| 3 | Strong customer passwords / resist guessing | N/A — no accounts. |
| 4 | Session expiration / resist hijacking | N/A — no sessions. |
| 5 | Login rate limits / resist brute force | N/A — no login. |
| 6 | Role-based authorization / prevent privilege escalation | N/A — no protected roles. |
| 7 | GitHub account MFA/passkeys / protect deployment | PARTIAL — owner must enforce and verify in GitHub. |
| 8 | Least-privilege CI credentials / limit compromise | PASS — workflow defaults `contents: read`; only deploy job has `pages: write`, `id-token: write`; checkout does not persist credentials. |
| 9 | Production deploy approval / prevent unauthorized releases | PARTIAL — require reviewers on `github-pages` environment and protected main; not verifiable from repository. |
| 10 | Registrar/hosting account MFA / protect domain | PARTIAL — owner dashboard action. |

### 2. Database and data protection
| # | Control / reason | Status and evidence or action |
|---|---|---|
| 11 | Parameterized SQL / prevent injection | N/A — no SQL/database. |
| 12 | DB least-privilege user / limit breaches | N/A — no DB. |
| 13 | DB encryption at rest / protect records | N/A — no DB. |
| 14 | DB backup encryption / protect copies | N/A — no DB. |
| 15 | DB network isolation / reduce exposure | N/A — no DB. |
| 16 | Avoid storing enquiries in browser / protect customers | PASS — source review: WhatsApp redirect only; localStorage holds language and analytics consent, sessionStorage holds route only. |
| 17 | Minimize collected data / limit disclosure | PASS — contact form asks message only; repair asks name, phone, date and service for WhatsApp enquiry; no site storage. |
| 18 | Sensitive backup handling / avoid public exposure | PARTIAL — no data backups needed today; owner must keep any future private business exports outside `public/`/`dist/` and restrict access. |
| 19 | Encrypt transport of enquiry / protect in transit | PARTIAL — WhatsApp URL is HTTPS and tested; hosting must serve site over HTTPS; WhatsApp privacy policies apply. |
| 20 | Data retention/deletion / minimize persisted data | N/A — no site-side customer data; WhatsApp retention controlled by shop and provider, owner must set its own policy. |

### 3. Web application vulnerability prevention
| # | Control / reason | Status and evidence or action |
|---|---|---|
| 21 | React text escaping / prevent XSS | PASS — source review: JSX text, no `dangerouslySetInnerHTML`/`innerHTML`. |
| 22 | No dynamic code execution / prevent injection | PASS — source review: no eval or Function constructor. |
| 23 | Same-origin deep-link restoration / avoid open redirects | PASS — `route-restore.js` checks same origin and base path; static scan and build. |
| 24 | Safe user-controlled navigation / avoid URL injection | PASS — WhatsApp URL uses fixed numeric shop config; `encodeURIComponent`; tests in `business.test.ts`. |
| 25 | External tab isolation / prevent reverse tabnabbing | PASS — reviewed links and `window.open` use noopener/noreferrer. |
| 26 | CSRF token / prevent forged writes | N/A — no state-changing server endpoint; client forms open WhatsApp. |
| 27 | SQL injection tests / detect unsafe queries | N/A — no queries. |
| 28 | Path traversal protection / prevent file reads | N/A — static assets only, no file-serving application endpoint. |
| 29 | HTML sanitization / prevent injected markup | PASS — customer input is rendered as React text in preview, URL-encoded for WhatsApp; no HTML interpretation. |
| 30 | Structured-data safe serialization / prevent script injection | PARTIAL — runtime JSON-LD uses `JSON.stringify` and `textContent`, not executable code; validate third-party SEO crawlers after CSP deployment. |

### 4. Input and form security
| # | Control / reason | Status and evidence or action |
|---|---|---|
| 31 | Repair required fields / prevent malformed requests | PASS — `validateRepair`, unit tests. |
| 32 | Repair select allowlists / reject forged values | PASS — service/category/source checked against allowed IDs, malicious-input tests. |
| 33 | Repair length limits / prevent oversized messages | PASS — name/phone/details max lengths in UI and validator; tests. |
| 34 | Repair runtime type checks / avoid type confusion | PASS — rejects non-string values before processing; test. |
| 35 | Date/time validation / reject impossible bookings | PASS — calendar and time checks; tests. |
| 36 | Phone normalization/validation / reject bad numbers | PASS — Bengali numerals supported; length/pattern tests. |
| 37 | Control-character checks / limit message spoofing | PASS — name/details reject control characters; tests. |
| 38 | Contact form limits / avoid unbounded input | PASS — 3–1000 character validation and control-character check; code review (no server rate limit). |
| 39 | WhatsApp message encoding / prevent URL parameter injection | PASS — `encodeURIComponent` and fixed `https://wa.me/917076884950`; unit tests. |
| 40 | Server-side spam/rate limits / stop automated submissions | N/A — no server form endpoint; automation can still message the business through WhatsApp (#90). |

### 5. HTTP security headers
| # | Control / reason | Status and evidence or action |
|---|---|---|
| 41 | Restrictive response CSP / reduce XSS | PARTIAL — Vercel `vercel.json`, static assertion; **GitHub Pages cannot serve custom headers**, verify on deployed Vercel. |
| 42 | No inline script/eval / enforce CSP | PASS — inline HTML scripts moved to self-hosted files, build scanner verifies emitted HTML and 404. |
| 43 | Frame restrictions / prevent clickjacking | PARTIAL — Vercel `frame-ancestors 'none'` and X-Frame-Options DENY; Pages cannot set them. |
| 44 | MIME nosniff / prevent content-type abuse | PARTIAL — Vercel header configured and checked; deploy verification needed. |
| 45 | Referrer policy / reduce URL leakage | PARTIAL — `strict-origin-when-cross-origin` configured; verify host response. |
| 46 | Permissions policy / minimize browser capabilities | PARTIAL — camera/microphone/geolocation denied; verify host response. |
| 47 | HSTS / resist downgrade | PARTIAL — intentionally **not enabled** until HTTPS works for all intended domains/subdomains; then configure at host, first `max-age=300`, increase after monitoring; includeSubDomains/preload only after owner verifies all subdomains. |
| 48 | Cache policy / avoid stale HTML | PARTIAL — Vercel HTML `no-cache, must-revalidate`, fingerprinted assets immutable; verify response and service behavior. |
| 49 | COOP / isolate browsing context | PARTIAL — Vercel `same-origin` configured; verify map and WhatsApp on deployed host. |
| 50 | CSP external resource allowlist / constrain requests | PARTIAL — scripts/styles/fonts/images self; map frames `maps.google.com`/`www.google.com`; navigation to WhatsApp/Google links is not governed by `connect-src`. Inspect real CSP violations on deployment. |

### 6. Hosting and network security
| # | Control / reason | Status and evidence or action |
|---|---|---|
| 51 | HTTPS for custom domain / prevent interception | PARTIAL — enable/verify in hosting and DNS, check HTTP redirects. |
| 52 | TLS certificate lifecycle / avoid expired certs | PARTIAL — verify host-managed renewals and external expiry alert. |
| 53 | DDoS mitigation / preserve availability | PARTIAL — use host/CDN protection; cannot provide at client code level. |
| 54 | DNS registrar lock/MFA / prevent takeover | PARTIAL — owner must enable and audit. |
| 55 | DNSSEC where supported / prevent DNS forgery | PARTIAL — verify registrar and DNS provider support/activation. |
| 56 | Deployment origin restrictions / stop hostile deployments | PARTIAL — configure production branch allowlist and protected environment in hosting. |
| 57 | No public production secrets / reduce credential theft | PASS — no configured frontend secrets; `.gitignore` protects local credentials; static secret-pattern scan. |
| 58 | No public data endpoints / avoid accidental data disclosure | PASS — build/source inspection: no server endpoints or public submissions. |
| 59 | Static host header support / enforce web protections | FAIL — current GitHub Pages deployment workflow cannot emit custom security headers; move production to Vercel or another header-capable host, or place a configured CDN in front. Do not treat `vercel.json` as active on Pages. |
| 60 | HTTPS-only resource loading / avoid mixed content | PASS — source review: map and WhatsApp are HTTPS, fonts/images local; `upgrade-insecure-requests` configured for Vercel. |

### 7. API and integration security
| # | Control / reason | Status and evidence or action |
|---|---|---|
| 61 | API authentication / prevent unauthorized calls | N/A — no own API. |
| 62 | API schema validation / reject bad payloads | N/A — no API endpoint. |
| 63 | API quotas / prevent resource exhaustion | N/A — no API endpoint. |
| 64 | CORS allowlist / prevent browser API abuse | N/A — no own cross-origin API. |
| 65 | WhatsApp official number / prevent misdirection | PASS — shop config contains 917076884950; build-time numeric validation and tests. |
| 66 | WhatsApp URL HTTPS / protect outbound message | PASS — `business.ts` constructs HTTPS only; tests. |
| 67 | Map opt-in / avoid premature tracking | PASS — map iframe rendered only after click; source review. |
| 68 | Safe external links / avoid tab access | PASS — explicit noopener/noreferrer; reviewed integration components. |
| 69 | Analytics disabled unless consent / protect privacy | PASS — endpoint null; if configured later, opt-in consent and HTTPS check in code; new endpoint needs CSP/host review. |
| 70 | Third-party script minimization / reduce supply chain | PASS — no remote JS/CSS or tag manager; build/source review. |

### 8. Dependency and source-code security
| # | Control / reason | Status and evidence or action |
|---|---|---|
| 71 | Lockfile / reproduce dependencies | PASS — `package-lock.json`, `npm ci` completed. |
| 72 | SCA / detect known CVEs | PASS — npm audit on 2026-10-30: 0 vulnerabilities (202 packages installed, 203 audited); automated weekly and per PR. |
| 73 | Transitive package review / reduce supply-chain risk | PARTIAL — npm audit includes transitives but not malicious/unpublished vulnerabilities; review changes before merging. |
| 74 | No unnecessary production plugins / reduce exposure | PASS — package review: production deps React/router, icons and local fonts; dev deps build/test/image tools; no security plugin installed. |
| 75 | Dependency integrity / prevent tampering | PASS — npm lockfile integrity metadata and `npm ci`; CI uses clean install. |
| 76 | Secret-pattern scan / prevent accidental commits | PASS — local `security:check` on tracked source patterns; not a full historical secret scan. |
| 77 | GitHub secret scanning / catch leaked credentials | PARTIAL — enable secret scanning and push protection in GitHub settings (availability varies); rotate any real exposed secret. |
| 78 | SAST/static checks / catch dangerous patterns | PARTIAL — local code review plus automated inline-script/header/secret checks; enable CodeQL/default setup for deeper SAST in GitHub. |
| 79 | Branch protection / prevent unauthorized edits | PARTIAL — GitHub branch protection API returned 403 `Resource not accessible by integration`; owner must set ruleset for main (PR, approvals, status checks, block force push). |
| 80 | Actions pinning / prevent action tag changes | PARTIAL — official actions are version-tagged but not SHA-pinned; pin reviewed immutable SHA revisions before strict supply-chain assurance. |

### 9. Bot, spam and DDoS protection
| # | Control / reason | Status and evidence or action |
|---|---|---|
| 81 | Server-side form rate limit / prevent spam | N/A — no submission endpoint. |
| 82 | Honeypot for server form / filter bots | N/A — no submission endpoint. |
| 83 | CAPTCHA / slow automated submissions | N/A — no submission endpoint; avoid unnecessary tracker. |
| 84 | Upload scanning / block malware | N/A — no uploads. |
| 85 | Upload type/size limits / block payloads | N/A — no uploads. |
| 86 | CDN traffic throttling / resist floods | PARTIAL — enable hosting/CDN WAF/rate limiting if traffic warrants; test only with provider-approved non-destructive checks. |
| 87 | Bot mitigation / protect availability | PARTIAL — use hosting/CDN controls; no site-side server to challenge requests. |
| 88 | Origin shielding / prevent direct origin floods | PARTIAL — choose provider configuration; static Pages origin currently outside our control. |
| 89 | Form-spam activity monitoring / catch abuse | PARTIAL — owner monitor incoming WhatsApp messages; website receives no submissions to log. |
| 90 | WhatsApp link abuse / prevent unsolicited messages | FAIL — anyone can message a public business number; client-side checks cannot rate-limit third-party WhatsApp; use WhatsApp Business block/report tools if abused. |

### 10. Monitoring, backups and recovery
| # | Control / reason | Status and evidence or action |
|---|---|---|
| 91 | Deployment audit / detect unexpected releases | PARTIAL — owner enable GitHub/host notifications and review deployment history daily. |
| 92 | Critical-file change review / detect defacement | PARTIAL — branch rule + CODEOWNERS/reviewers should cover `src/config/shop.ts`, `vercel.json`, workflows, dependencies. |
| 93 | Login failure alert / detect brute force | N/A — no application login. |
| 94 | Traffic-spike alerts / catch DDoS | PARTIAL — configure host analytics alerts without collecting customer message contents. |
| 95 | Dependency alerts / catch new CVEs | PARTIAL — weekly audit workflow committed; enable GitHub Dependabot alerts and verify workflow actually runs. |
| 96 | Hosting/TLS alerts / catch outages | PARTIAL — configure host incident and certificate-expiry notifications. |
| 97 | Version-controlled source / recover from changes | PASS — Git repository; build and tests reproducible locally. |
| 98 | Private business configuration backup / preserve operations | PARTIAL — owner export shop operational config privately and test restore; never place sensitive exports in `public/`. |
| 99 | Customer-data backups / prevent data loss | N/A — no customer data stored here; shop's WhatsApp data managed separately. |
| 100 | Emergency rollback / restore availability | PARTIAL — runbook below; perform a rehearsal on host before claiming tested. |

## Findings and remediation

Fixed in this branch: CSP-incompatible inline route/preload/404 scripts; missing response-header configuration for Vercel; weak repair select/length/type validation and contact message length/control checks; deployment workflow's extra branch deployment and broad Pages token in build; missing automated SCA/static checks and local secret ignore patterns. The existing Vercel header set lacked CSP, frame and cache policies. No SQL injection, auth bypass or CSRF endpoints exist. Existing WhatsApp encoding, React escaping and no-opener links were retained.

Remaining: GitHub Pages **does not honor `vercel.json`** and cannot set the configured headers. The active production host/domain is unconfirmed. HSTS, WAF, DNS/MFA, GitHub rules and alerts require owner-controlled configuration. GitHub protection API query returned 403; it was not changed. No live traffic, TLS, deployed-header, DDoS or destructive tests were performed. The site has no server-side limit on WhatsApp messages. The CSP may need adjustment for actual Maps iframe subresources: start with the narrow policy; inspect browser console and CSP reports after deploying on Vercel rather than adding wildcards or `unsafe-inline`. Optional future analytics endpoint requires explicit `connect-src` allowlisting and separate privacy review.

## Release checklist and recovery

1. **Choose one production host.** Prefer a header-capable host such as Vercel using `vercel.json`. If keeping GitHub Pages, put a configurable HTTPS CDN in front and reproduce the policy there; do not claim headers are active from repository config. Set production to deploy only protected `main`. Confirm real domain and `VITE_SITE_URL`/base path with owner. Don't add HSTS until HTTPS works on every intended host; test HTTP→HTTPS, cert chain and renewal; then staged HSTS. Validate `curl -I https://YOUR-DOMAIN/`, a deep link, assets, map click and WhatsApp buttons in both languages. Look for CSP violations; verify actual CSP, frame, nosniff, referrer, permissions, cache and COOP response headers. Confirm no secrets exposed in `dist`.
2. **GitHub settings:** enforce MFA; protect `main` with required PR reviews, `Security checks / verify` and build checks, disallow force pushes/deletion, require conversation resolution; restrict workflows to reviewed sources, environment `github-pages` reviewers, production branch only, minimal repo write access. Enable Dependabot alerts, code scanning/CodeQL, secret scanning and push protection if available. Pin action SHAs after reviewing official release digests. Protect Vercel account, deploy tokens, registrar and DNS provider with MFA and least privilege. Review webhook/integration access and production deployments.
3. **Monitoring:** check host traffic/deploy/security alert dashboards, GitHub workflow and Dependabot alerts, and WhatsApp spam daily; review TLS expiry weekly. Alert on unexpected deployments, changes to shop config/workflows/dependencies and downtime. Keep aggregate logs with short retention; do not log enquiry text or phone numbers.
4. **Backup:** Git source and lockfile are the recoverable build source; separately keep a restricted copy of business configuration/domain/DNS settings and any business-managed WhatsApp data as required by the owner. Do not store sensitive backups under the static public tree. Quarterly restore drill: clone a clean checkout, `npm ci`, `npm run check`, `npm run security:check`, preview locally, compare business number and URLs. Document result privately.
5. **Rollback:** identify last known-good commit and its verified deployment in GitHub/host dashboard; roll back via host's deployment rollback UI (or revert via a reviewed PR to `main`), then recheck TLS/headers, phone/WhatsApp links, deep links and maps. Never force-push protected `main`. If credentials leak, revoke/rotate them before redeployment and investigate audit logs. If compromised, temporarily disable deployment, preserve non-sensitive evidence and notify owner.
6. **Before each change:** run `npm ci`, `npm audit --audit-level=moderate`, `npm run check`, `npm run security:check`, review lockfile changes. Run safe browser tests (`npm run test:e2e`) in a controlled preview with installed browser; no live destructive scanning. For new backends/forms/auth, redo threat model and add server-side validation, rate limiting, CSRF, access control and data-backup controls.

OWASP review: A01 access control, A02 crypto, A03 injection, A04 design, A05 misconfiguration, A06 vulnerable components, A07 authentication, A08 integrity, A09 logging, A10 SSRF were evaluated against the static architecture. Relevant ASVS areas include V1 architecture, V3 sessions (N/A), V4 access (N/A), V5 input, V8 data, V9 communications, V10 malicious code, V12 files (N/A), V13 API (N/A), V14 configuration. Automated checks do not prove an ASVS certification. Safe XSS validation covers rendered text and blocked inline execution in built HTML; no server CSRF/SQL/access-control tests can run without those features. Production response/TLS verification remains pending.
