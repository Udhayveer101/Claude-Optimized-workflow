# 08 — Reliability, error handling, concurrency

Error-handling gaps are ~2× as common in AI PRs as human PRs (CodeRabbit). AI code "doesn't fail
loudly — it fails correctly-looking."

## Error handling
- Swallowed exceptions: `catch {}`, `except: pass`, `try? …`, `.catch(() => {})` — failures become
  silent data loss.
- Over-broad catch that also swallows programming errors and cancellation.
- Errors logged but not surfaced; user sees a spinner forever.
- Raw exception text / stack trace shown to the user or returned by the API (info disclosure).
- No distinction between *retryable* and *fatal*; retries with no backoff, no jitter, no cap →
  self-inflicted DoS and runaway bills.
- No timeouts on network calls, subprocesses, or locks → hung UI, exhausted pools.
- No idempotency on payment/mutation endpoints → double-charge on retry.
- Partial failure ignored in batch loops: one item throws, the rest silently never run.
- Cleanup not in `finally`/`defer`/`withTaskCancellationHandler` — file handles and locks leak on
  the error path.
- No offline/airplane-mode path; no handling of permission-denied; no handling of disk-full.

## Nulls and edge cases
Missing null checks, unchecked array indexing, empty-collection assumptions, force unwraps (`!`,
`as!`), unchecked optional chaining, off-by-one, integer overflow, division by zero, empty-string
vs nil, first/last on empty, unicode/emoji length, locale-dependent parsing, timezone/DST,
leap-year/leap-second, floating point money, sorting stability, very large inputs.

## Environment parity ("runs on my machine, 500s in prod")
AI generates for the dev laptop it can imagine. In production it breaks on:
- Hardcoded local paths / `localhost` / dev ports; writes to a path that's read-only or
  ephemeral on the host (serverless, containers).
- Different DB engine local vs prod (SQLite → Postgres): dialect, type coercion, autoincrement,
  case-sensitivity, transaction semantics all differ.
- Env vars assumed present with no default and no startup check.
- Dev-only config shipped: debug on, permissive CORS, seed/test data, `NODE_ENV` unset.
- Case-insensitive FS locally, case-sensitive Linux container → import fails.
- Dev-machine timezone/locale baked into parsing/formatting.
This class is a large slice of the 43% of AI changes that need extra debugging after deploy
(Lightrun 2026).

## Concurrency
- Shared mutable state accessed from multiple threads with no lock — AI writes this constantly
  and tests never catch it because tests run sequentially.
- TOCTOU: `if exists(path) { open(path) }`.
- Async race on initialisation; double-initialisation; singletons built non-atomically.
- Caches with races on fill; cache stampede with no single-flight.
- UI updates from a background thread (main-actor violations).
- Deadlock from nested locks / sync-on-main from a background queue.
- Unawaited promises/tasks — fire-and-forget work whose failure disappears.
- No cancellation propagation; work continues after the view is gone (and then touches a
  deallocated object).
- Non-atomic file writes — crash mid-write corrupts user data. Write-temp-then-rename.
- No migration/versioning of persisted state → crash loop on upgrade for existing users.

## Rules
1. Every catch either handles, wraps with context, or rethrows. Never empties.
2. Every external call has a timeout, a bounded retry with exponential backoff + jitter, and a
   defined failure UX.
3. Every shared mutable structure has a documented owner (actor/lock/queue).
4. Every destructive or money-moving operation is idempotent and transactional.
5. Persisted data writes are atomic and version-tagged.
6. No hardcoded local paths or dev-only config; same DB engine local and prod; config from env
   with a startup check; the production error path has actually been exercised.
