# Session, token and permission lifecycle

`authz.md` has the *static* picture (verify signature + `exp`/`aud`/`iss`, filter by owner, don't
trust the client). This is the *time* dimension. The AI baseline is a login route that mints a
JWT + middleware that verifies signature + `exp` — auth as a stateless pure function of the token,
no server-side lifecycle state. Almost every gap below follows.

## Token lifecycle

- **Refresh rotation without reuse detection.** Rotation is implemented (new RT, mark old used)
  but a replayed old RT is only rejected, not treated as a breach. RFC 9700: on detected replay,
  invalidate *all* refresh tokens for that grant (needs a stored `family_id`). Rotation without
  detection is near-useless.
- **Stateless-JWT revocation gap.** Logout deletes the token client-side only; it stays valid
  until `exp`. Same for ban / forced reset. Mitigation set: access-token TTL 5–15 min, plus a
  revocation check for high-value routes — a `jti` deny-list, a per-user `tokenVersion`, or
  introspection.
- **Access-token TTL == refresh-token TTL** (`expiresIn: '7d'`). Silently disables every
  mitigation here. Access 5–15 min; refresh rotating + revocable + an **absolute lifetime cap**
  and a server-enforced idle timeout.
- **"Remember me" = a bigger `exp`** in `localStorage`, not rotated, no ceiling. Make it a
  rotating, revocable refresh token in an `HttpOnly; Secure; SameSite` cookie.

## Permission freshness

- **Role downgrade doesn't reach live tokens.** Role/scopes baked into the JWT at login; a demoted
  admin keeps `role: admin` until expiry. For privileged routes, resolve permissions from a fast
  live store (short TTL + bust on change) or bump `tokenVersion` on any role change.
- **Client-side permission cache goes stale.** Route guards / menus / feature gates run off a
  login-time blob; after a server downgrade the UI keeps offering privileged actions — and
  sometimes the client is the *only* check. Client permissions are pure UX; enforce every action
  server-side against fresh authority.

## Session lifecycle

- **No session-ID rotation on login / privilege change (fixation).** Login sets `session.userId`
  without `regenerate()`. Regenerate on login, logout, and any elevation.
- **No concurrent-session control.** No "active sessions", no "log out everywhere", and a
  password change / recovery does **not** kill other sessions — so a user who changes their
  password because they suspect compromise leaves the attacker in. Maintain per-user
  `tokenValidAfter` / `tokenVersion`; bump on password change, recovery, and explicit global
  logout.

## Token type / audience confusion

- **Audience confusion.** Services share a key/IdP and none validate `aud`; a token for the
  "notifications" API is accepted by "payments". Every resource server validates `iss` + `aud`
  against its own identifier; use per-audience tokens.
- **ID token used as an access token.** The OIDC client sends `id_token` as the bearer and the
  API accepts it. Reject any token whose `aud` is a client_id.
- **JWT `alg` / `kid` / `jku` / `jwk` confusion.** Verification trusts the token's own `alg`, or
  resolves the key from an attacker-supplied header. RFC 8725: pin exactly one expected
  algorithm; never resolve keys from `kid`/`jku`/`jwk` unless allow-listed. (Extends `alg: none`.)

## OAuth flow integrity

- **`state` + PKCE missing on public / SPA clients.** RFC 9700 mandates PKCE (S256) for **all**
  client types, plus a random `state` bound to the session and verified on return, plus OIDC
  `nonce`.
- **Open redirect in the callback.** `returnTo`/`next` redirected with no allow-list, or
  `redirect_uri` matched by prefix/substring. RFC 9700 requires **exact string matching** on
  `redirect_uri`; internal redirects are relative-path allow-listed.
- **No step-up auth; MFA bypass via recovery.** After login everything is one trust level; and
  "forgot password" resets access without satisfying MFA. Gate sensitive ops on a recent
  `auth_time` (and a fresh factor for the most sensitive); recovery re-asserts MFA, notifies, and
  delays.

## Checklist

- [ ] Refresh rotation revokes the whole token family on replay
- [ ] Access-token TTL is 5–15 min; a revocation path exists for high-value routes; absolute + idle session caps enforced
- [ ] Role/permission changes take effect on live sessions (live-store lookup or `tokenVersion` bump)
- [ ] Every privileged action is enforced server-side against fresh authority, never just a client route guard
- [ ] Session ID / token context is rotated on login, logout, and privilege change
- [ ] Password change and account recovery terminate all other sessions
- [ ] Every resource server validates `aud` + `iss`; ID tokens rejected as bearers; one pinned `alg`, no header-supplied keys
- [ ] OAuth code flow uses PKCE (S256) + a verified `state`; `redirect_uri` is exact-match
- [ ] Sensitive operations require step-up auth; recovery flows re-assert MFA

Deeper: the project research vault, "Session, token and permission lifecycle".
