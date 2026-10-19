# Rollout, migration and change safety

`data-layer.md` says "migrations reversible, run in CI." `release.md` says "rollback plan /
kill-switch." Both assume the change is one atomic event. It isn't: a real deploy is a *window*
where version N and N+1 run against the same database, on a fleet that updates one instance at a
time. AI sees one migration file + one diff and has no model of that window.

## Schema migration

- **One-step `add NOT NULL column + backfill + switch reads`.** Old instances still running hit a
  column they don't know, or a `NOT NULL` they can't satisfy. Do **expand → migrate → contract**
  across releases: add nullable → deploy code that dual-writes and tolerates null → batched
  backfill → add `NOT NULL` later → switch reads → drop old column a release later.
- **DDL lock semantics differ by engine/version.** `ADD COLUMN … DEFAULT <volatile>` or a later
  `SET NOT NULL` rewrites the whole table under an exclusive lock. Always set `lock_timeout` +
  `statement_timeout` on the migration session. Migration linters (Squawk, Strong Migrations)
  catch these.
- **Unbatched backfill `UPDATE`** over the whole table: row locks everywhere, WAL/undo bloat,
  timeout + rollback after hours, stalled replication. Batch by PK (1k–10k), commit each, sleep,
  watch replica lag, resumable, out of band from the deploy.
- **`CREATE INDEX` (non-concurrent) inline with the deploy** takes an exclusive lock and hangs
  the deploy while queuing all of production. `CREATE INDEX CONCURRENTLY` / gh-ost / pt-osc.
- **No dual-write transition** when moving data between stores/columns: a hard cutover loses
  writes after the backfill snapshot; a rollback loses new-location writes. Dual-write, backfill,
  shadow-read compare, flip reads by flag, keep dual-write until the old store is unused.
- **Old code must tolerate the new schema too.** The N-1 release still on half the fleet does
  `SELECT *` and chokes on the new column. Never `SELECT *` in app code; additive-only per
  release; a CI gate booting the N-1 tag against the N schema.
- **Migration-runner concurrency.** Two replicas race a non-idempotent migration. Rely on the
  framework's migration lock; each step idempotent (`IF NOT EXISTS`) and checkpointed.

## Rollback

- **Rollback reverts code but leaves the schema ahead.** Old code now runs against a schema it
  wasn't written for. Keep code and schema compatible one version each direction; treat
  down-migrations as unreliable; for destructive steps, roll *forward* with a fix.
- **Rollback assumed universal for irreversible actions.** Emails sent, cards charged, rows
  deleted, queue messages consumed — redeploying old code un-does none of it. Gate irreversible
  effects behind their own slow rollout, a global send-rate circuit breaker, a dry-run mode,
  idempotency keys, and a hard cap that alerts.

## Progressive delivery

- **No canary / staged rollout** — 100% of traffic gets the new version at once; a load- or
  data-dependent defect hits everyone before anyone reads a graph. Roll out to a small % / one
  cell, bake, compare canary vs baseline on error rate + latency + a business metric,
  auto-roll-back on regression, then stage by region/cohort with a go/no-go between waves.
- **Config changes shipped with less rigor than code** — a large share of major outages are
  config changes, often deployed globally by hand with no test. Config as code: reviewed,
  schema-validated, canaried, staged, versioned, one-command revert.

## Feature-flag lifecycle

- **Flag with no owner / removal date / default-safety analysis.** Flags accumulate; combinations
  are untested; a flag's default in a *new* environment (DR region, new tenant, fresh deploy) is
  whatever the literal says, or the provider is unreachable and the fallback is undefined. Knight
  Capital (2012): a repurposed retired flag ran dead code → ~$460M in 45 minutes. Every flag: an
  owner + a removal ticket at creation; an explicit tested fail-safe default; never reuse a key;
  delete the flag *and its dead branch* as the last rollout step.
- **Flags that gate security controls.** `if (flags.enforceAuthz)` — provider down or key missing
  in a new env → the control is silently off. Security controls aren't flagged; if staged, they
  fail *closed*, are change-controlled, and alert when off.
- **Kill switch depends on the system it disables.** It reads the same DB / config service /
  flag backend that's failing. It must read from an independent failure domain, cache its last
  value locally, default safe on any error, take effect without a deploy, and be game-day tested.

## Checklist

- [ ] Schema changes use expand/contract; no non-nullable/renamed/typed column in the release that first uses it
- [ ] `lock_timeout` + `statement_timeout` on migrations; `CREATE INDEX CONCURRENTLY`; backfills batched + resumable
- [ ] CI gate: the N-1 release boots and passes against the N schema; no `SELECT *` in app code
- [ ] A code-only rollback is always safe against the current schema; irreversible effects are separately gated + rate-capped
- [ ] Pipeline has a canary stage with a bake period and an automated metric gate + auto-rollback
- [ ] Config changes are reviewed, schema-validated, and staged like code
- [ ] Every flag has an owner, a removal date, and a tested fail-safe default; no flag key is ever reused
- [ ] No security control is flag-gated (or it fails closed and alerts when off)
- [ ] The kill switch reads from an independent failure domain and has been exercised

Deeper: the project research vault, "Rollout, migration and change safety".
