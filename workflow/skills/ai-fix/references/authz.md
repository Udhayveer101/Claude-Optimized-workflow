# 04 — Authentication and authorisation

Broken access control is OWASP #1 and the category AI skips most reliably, because *authorisation
is invisible in a working demo*.

## What AI does
- **Puts auth logic in the browser.** Password comparison in JS, `if (user.isAdmin)` gating a
  route in the client only, hidden UI treated as a security control. (Wiz: real apps found with
  passwords embedded in JavaScript.)
- **Authenticates but never authorises.** Endpoint checks *that* you are logged in, not *whether
  this record is yours* → IDOR / BOLA. `GET /api/invoice/1043` returns anyone's invoice.
- Skips ownership filters in queries (`where id = ?` without `and user_id = ?`).
- Trusts client-supplied identity: `userId` from request body, `role` from a cookie, unverified
  JWT (`decode` instead of `verify`), unverified Firebase ID token on the server.
- `alg: none` / no signature verification / no `aud`/`iss`/`exp` checks.
- No session invalidation on logout or password change; infinite-lifetime tokens; no refresh
  rotation; tokens stored in `localStorage` (XSS-readable).
- Ships internal/admin/staging surfaces with **no auth at all** — Wiz found internal dashboards,
  knowledge bases and chatbots with production data publicly reachable.
- No rate limiting on login/OTP/password-reset → credential stuffing, OTP brute force, SMS
  pumping bills.
- Password reset tokens that are guessable, non-expiring, or reusable; user enumeration in
  "email not found" responses.
- Missing CSRF protection on cookie-authenticated state-changing routes.
- No multi-tenant isolation: a shared table with no tenant filter on collection-level reads.
- Role hierarchy not enforced downward — a lower role can edit a higher role's records.

## Rules
1. Every mutation and every read of user data is authorised **server-side**, per record.
2. Deny by default. New endpoint = no access until a rule grants it.
3. Never trust any identity claim that arrived from the client; derive it from a verified token.
4. Client-side checks are UX only. Assume the attacker calls the API directly with curl.
5. Rate-limit and lock out on all credential endpoints.
6. Test the negative case: log in as user A, request user B's object, expect 403.
