# 06 — Data layer and backend configuration

Wiz: the single biggest source of critical findings across every vibe-coded app scanned was
**Row Level Security left off**.

## What AI does
- Creates tables and never writes RLS / Firestore rules / security rules — or writes
  `allow read, write: if true` to make the error go away.
- Leaves the default open rule from the quickstart and never revisits it.
- Grants access with `if request.auth != null` — i.e. *any* signed-in user reads *everyone's*
  data. This is the most common near-miss: it looks like a real rule.
- Misses **collection-group queries**, which bypass path-scoped rules unless explicitly handled.
- Ships the admin/service key so it never has to think about rules at all.
- Exposes an unauthenticated REST/GraphQL surface (GraphQL introspection + no depth/cost limit).
- No migrations, or destructive migrations with no rollback; schema drift between envs.
- No DB backups, no point-in-time recovery, no tested restore.
- Missing indexes → full scans; no `LIMIT`; unbounded `SELECT *`; N+1 queries in loops.
- No constraints: nullable everything, no foreign keys, no unique constraints, no check
  constraints, money in floats.
- No transaction around multi-step writes → partial state on failure.
- Soft-delete implemented but read paths forget to filter deleted rows.
- Storage buckets public-read; signed URLs with no expiry; no per-user path scoping.
- CORS `Access-Control-Allow-Origin: *` combined with credentials.
- Debug mode / verbose stack traces / directory listing enabled in production.
- Default ports, default admin credentials, management UI exposed publicly.
- No TLS enforcement, no HSTS, mixed content, certificate validation disabled to fix a dev error.

## Rules
1. Deny by default at the database, then grant per-table, per-operation, per-row, tied to the
   authenticated principal's own id/tenant.
2. Every rule set gets a *negative* test: another user's row must be unreadable.
3. Secrets/keys never client-side; privileged operations behind server functions.
4. Migrations versioned, reversible, and run in CI.
5. Security headers on every response: HSTS, CSP, X-Content-Type-Options, Referrer-Policy,
   frame-ancestors. CORS explicitly enumerated origins.
