# Android: installable, offline-ready, one thumb

Most customers find the shop on Google Maps, on an Android phone, often on a
weak connection. The website is built for exactly that: a Progressive Web App
that installs from Chrome, opens full-screen, and keeps the shop's phone number
and directions working even without the internet.

There is no separate native app to maintain. The same code is the website and
the app.

## What the customer gets

| On the website | After “Install app” |
| --- | --- |
| Loads from a tap in Chrome | Opens full-screen from the home screen, no address bar |
| WhatsApp, call, directions | Same, plus a home-screen icon and app-switcher card |
| Google Maps embed loads only on request | Same |
| Works offline once visited | Home, last catalogue, shop details, offline page |
| A shortlist saved on the phone | Same list, still on the phone |

The install prompt appears after a few seconds, at most once every 14 days. It
never blocks the page, and the same option is always available in the menu and
footer (“অ্যাপ হিসেবে রাখুন”).

## How to install on Android

1. Open the site in **Chrome** (not the in-app browser inside Facebook, WhatsApp
   or Instagram — those cannot install PWAs).
2. Either tap **অ্যাপ ইনস্টল করুন** in the prompt, or use the ⋮ menu →
   **Install app / Add to Home screen**.
3. The icon appears with the shop's wheel mark. Opening it uses the standalone
   display mode.

If Chrome offers “Add to Home screen” instead of “Install app”, the site still
works, but it may open with a browser bar. That usually means the manifest or
service worker has not been served correctly — check the deployed build, not the
preview URL.

## What works offline

The service worker caches the app shell, the shop's own photographs and the last
catalogue. After one visit:

- the home page, shop address, phone and WhatsApp links still open;
- the last catalogue and prices are shown with a “saved catalogue” note;
- calling and WhatsApp use the phone's own network, so they work whenever there
  is any signal, even if the page was cached;
- Google Maps is never cached (it is a third-party service) — the “directions”
  button opens the Maps app instead.

Nothing personal is cached: the shortlist stores product names and quantities
only, and stays in `localStorage` on the customer's phone.

## Testing on a real Android phone

1. Deploy a preview (Vercel preview URL or a tunnel to `npm run dev`).
2. Open it in Chrome, then **⋮ → Add to Home screen** to confirm installability.
3. Open **Chrome DevTools → Lighthouse** with **Mobile** selected and
   *Simulated throttling* on. Target: Performance ≥ 90.
4. In DevTools → **Network → Slow 4G**, reload: the first screen should be usable
   in about three seconds.
5. Switch to **Airplane mode**, reload: the cached page or the offline page must
   appear, with working call and WhatsApp buttons.
6. Tap with a thumb, one-handed: WhatsApp, Call, Directions and My list are all in
   the bottom bar, above the Android navigation area (`safe-area-inset-bottom`).
7. Turn on **TalkBack** and swipe through the header, catalogue and shortlist.
   Every control has a visible focus state and a spoken label.
8. Test in bright sunlight and with large font size (Android Settings → Display →
   Font size). The layout uses rem-free px sizing like the rest of the site; check
   that the action bar labels still fit.

The automated Playwright suite already covers 320–1440 px widths, keyboard
navigation, Bengali/English switching and axe WCAG A/AA checks. It cannot cover
a real phone's soft keyboard, network handover or TalkBack verbosity — do those
by hand.

## Optional: publish on the Play Store with a Trusted Web Activity

A TWA is a thin Android wrapper around the same PWA. It is worth it only if you
want a Play Store listing; the installed PWA already gives customers an icon.

Prerequisites: Node 18+, JDK 17, Android SDK, a Google Play developer account,
and the site already live on a single HTTPS domain.

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://YOUR-DOMAIN/manifest.webmanifest
bubblewrap build      # produces app-release-signed.apk + .aab
```

During `init`, set:

- **Application ID**: `in.kanchancyclestores.app` (or your own domain)
- **Display mode**: `standalone`
- **Orientation**: `portrait`
- **Theme colour**: `#14432f`
- **Include support for Chrome OS**: your choice
- **Signing key**: let Bubblewrap create one, then back it up offline. Losing it
  means losing the ability to update the listing.

Then serve the Digital Asset Links file so Android trusts the wrapper and hides
the address bar:

```json
// https://YOUR-DOMAIN/.well-known/assetlinks.json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "in.kanchancyclestores.app",
    "sha256_cert_fingerprints": ["SHA256_FINGERPRINT_FROM_YOUR_KEYSTORE"]
  }
}]
```

Get the fingerprint with `keytool -list -v -keystore android.keystore`.
The file must be served as `application/json` with a 200 status and no redirect.
That file is deployment-specific, so it is **not** committed here.

Practical notes:

- The Play Store requires a privacy policy URL and a data-safety form. The site's
  `/privacy` page is written for that.
- A TWA that fails asset-link verification shows a browser bar and may be rejected
  for looking broken. Verify before submitting.
- Test signed builds on a real device; the Play Store version is signed by Play
  App Signing, so use the fingerprint Google shows you, not only your upload key.
- App updates: the PWA updates itself. The wrapper only needs a new build when
  Android-level settings change.

## Keeping the 14-day install nudge honest

`src/pwa.tsx` stores only a dismissal timestamp (`kanchan-install-dismissed-until`).
There is no device fingerprinting, no push notification permission prompt, and no
tracking. If the customer installs, the prompt disappears for good.

## Known Android caveats

- **In-app browsers** (WhatsApp, Facebook, Instagram) cannot install a PWA. The
  footer instruction explains how to open it in Chrome instead.
- **Google Maps sometimes opens a Custom Tab.** That is Chrome, so install and
  the service worker work normally.
- **A brand-new deployment can be cached for one visit.** The site shows a
  “new version ready — refresh” bar; tapping it activates the new worker.
- **Data Saver / Lite mode** may hold back images. The page is text-first, so the
  shop details still render.
- **Battery saver** can delay the service worker on the very first visit. The
  website remains fully usable online without it.

## Performance budget for this site

| Item | Budget | Where |
| --- | --- | --- |
| Initial JS (gzip) | ≤ 130 kB | `npm run build` output |
| Initial CSS (gzip) | ≤ 20 kB | same |
| Hero image | ≤ 70 kB on phones | `storefront-480.webp` |
| Fonts | Bengali subset only, 2 weights, woff2 | `src/main.tsx` imports |
| Third-party requests before consent | 0 | no analytics, map only on request |
| Lighthouse mobile performance | ≥ 90 | measure; do not assume |

The owner desk (`/owner`) is a separate 7 kB chunk that customers never download.
