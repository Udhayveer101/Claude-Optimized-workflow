# 13 — Platform specific: mobile and web

## Mobile (iOS / Android / Flutter / React Native)
- Secrets compiled into the binary; API keys in `Info.plist`, `strings.xml`, `.env` bundled as an
  asset. `strings` on the binary reveals them.
- Certificate validation disabled / `NSAllowsArbitraryLoads` / `cleartextTrafficPermitted=true`
  added to fix a dev-server error and never removed.
- Deep links / URL schemes / intent filters accepted without validating origin or parameters →
  unauthorised actions from a web page.
- Exported Android components (activities/services/receivers/providers) left exported.
- WebViews with JavaScript bridges exposing native capability to remote content.
- Sensitive data in `UserDefaults`/`SharedPreferences`, in screenshots/app-switcher snapshots, in
  clipboard, in logs (`print`/`Log.d` shipped in release).
- Backgrounding/interruption states unhandled; no state restoration; work lost on suspend.
- Permissions requested at launch without rationale; denial path unimplemented (crash or
  dead-end); purpose strings missing → store rejection.
- Push/notification tokens not rotated; notification content leaking PII on the lock screen.
- No offline behaviour; assumes network is always available and fast.
- Memory/battery: image decoding on the main thread, location updates at max accuracy always.
- Store readiness: privacy manifest / data safety form mismatched with actual SDK behaviour,
  missing account-deletion flow (required by both stores), IAP restore missing, target API level
  below the current requirement, missing 64-bit/architecture support.
- Localisation: hardcoded strings, no RTL support, truncated layouts, unlocalised dates/numbers,
  and — a repeated real-world miss — **updating UI text in one language file only**.

## Web / frontend
- Auth or price/quantity logic in the client; server accepts whatever the client says.
- `NEXT_PUBLIC_`/`VITE_` prefixes on real secrets.
- No CSP, no HSTS, no `X-Content-Type-Options`, `frame-ancestors` unset (clickjacking).
- CORS `*`, or reflecting `Origin` with credentials enabled.
- Tokens in `localStorage`; cookies without `HttpOnly`/`Secure`/`SameSite`.
- `dangerouslySetInnerHTML` on user content; markdown/HTML rendered unsanitised.
- Source maps published to production revealing full source and comments.
- `blob:`/object URLs never revoked (leak) and blob links used to hand users files (leaks the URL
  and breaks on some browsers) — prefer a proper share/save API.
- Client-side routing that "hides" admin pages while the API remains open.
- No loading/empty/error states; no skeletons; layout shift; unbounded lists.
- Accessibility, which AI omits almost entirely unless asked: missing alt text and labels (or
  placeholder alt text left in), non-semantic `div` buttons, no keyboard navigation, no focus
  management in modals, focus traps missing, contrast below 4.5:1, no reduced-motion respect,
  no screen-reader announcements for async updates, form errors not associated with inputs.
- SEO/meta and social cards omitted; no `robots.txt`; no canonical URLs.
- No 404/500 pages; unhandled promise rejections crashing the render.
