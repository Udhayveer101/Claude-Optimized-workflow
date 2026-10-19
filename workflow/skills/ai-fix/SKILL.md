---
name: ai-fix
description: Audit and harden any app that was built with AI assistance ("vibe coded") against the failure classes AI systematically misses — exposed secrets, missing authorization, injection, open database rules, hallucinated dependencies, swallowed errors, race conditions, unbounded caches and leaks, N+1 queries, runaway agent/LLM cost, environment mismatch, AI toolchain and MCP risks, session and token lifecycle gaps, missing observability, distributed-systems and caching failure modes, unsafe schema migrations and rollouts, privacy and logging leaks, platform hardening, and release blockers. Use this whenever the user asks to review, audit, security-check, harden, clean up, "make sure nothing is wrong with", or ship/release/distribute an app or feature, and whenever finishing a feature that Claude wrote — even if they don't say "security" or "audit". Also use before any App Store / Play Store / notarized / production deploy.
---

# AI Fix

AI-assisted code fails in a narrow, predictable set of ways. This skill turns those into a
repeatable audit so they don't reach users.

**Why these failures repeat** — worth holding in mind, because it tells you where to look:
a model optimises for the most plausible continuation, so the happy path is excellent and
everything guarding it is thin. Edge cases are statistically rare, so they get dropped. The model
never sees production, so scale, concurrency and cost bugs are invisible to it. It sees one file,
not every caller. And under friction — a CORS error, a permission denial, a type error — the
fastest fix is always to widen a boundary (`if true`, `*`, `catch {}`, `disable-library-validation`),
which permanently removes a protection and never comes back for review.

For hard numbers on how common each class is, see `references/evidence.md`.

## How to run an audit

**1. Scope it.** Ask what changed, or infer it: a single feature, a subsystem, or the whole app
before release. Full-app audits are for release gates; day-to-day, audit the diff and everything
it touches. State the scope you chose so the user can widen it.

**2. Understand the app before judging it.** Identify: the stack, where the trust boundaries are
(client↔server, user↔database, app↔helper/root, app↔third party), what data is sensitive, what
runs with elevated privilege, and how it ships. Findings are only real relative to a trust
boundary — a hardcoded value in a server-only file is not the same finding as the same value in
a bundle the user downloads.

**3. Quick pass first.** Run `scripts/quickscan.sh <dir>` — a grep sweep for the classes that
are visible textually (secret literals, open rules, swallowed errors, disabled TLS, risky
entitlements, suppressions). It produces leads, not findings; it exists so you spend your reading
time on the parts that need judgement rather than on regexes.

**4. Sweep the categories.** Work through the checklist below. Use the reference files for the
categories that apply — don't load all of them; load the ones the stack actually has.

**4b. Mark what the code can't settle.** For each category, some checks are *AI-complete* — you
can confirm them from the source in front of you — and some are *engineering-complete* — only a
load test, a pentest, a game day, a real device, a multi-week soak, or a wall clock actually
closes them (backups that restore, failover that recovers cleanly, a cert that expires in 90
days, behaviour at 100× the data). Say which findings are which, and name the test that would
close the open ones. A report that doesn't separate the two implies coverage it doesn't have.

**5. Verify each finding before reporting it.** Read the surrounding code and confirm the bug is
reachable. A finding you can't state as "attacker/user does X → Y happens" is a hunch, not a
finding. Report hunches separately and say they're unverified. False findings cost the user more
than a missed low-severity one, because they teach them to ignore the next report.

**6. Report, then fix.** Group by severity, most severe first. For each: file:line, one sentence
on the defect, the concrete failure scenario, and the fix. Then apply the fixes the user approves,
smallest correct diff, at the shared root rather than per caller.

**7. Prove it.** Re-run the checks, the build, and the tests. Don't claim something is fixed
without output confirming it. If part of the audit was blocked (no credentials, can't run the
scanner), say so explicitly rather than quietly narrowing scope.

## The checklist

Run every line. Mark each ✅ pass / ⚠️ finding / N/A — an unmarked line is an unchecked line, and
the whole value of this skill is that nothing gets skipped because it looked unlikely.

### Secrets → `references/secrets.md`
- [ ] No API keys, tokens, passwords, connection strings, or private keys in source
- [ ] Nothing secret in anything shipped to a client (JS bundle, `NEXT_PUBLIC_*`/`VITE_*`, app binary, plist, resources) — grep the **built artifact**, not just source
- [ ] No privileged/admin/service keys outside the server
- [ ] Git history clean; `.gitignore` covers env files, keys, keystores, provisioning profiles
- [ ] Any secret ever committed, logged, or bundled is **rotated**, not just deleted
- [ ] Secrets loaded at runtime from env / keychain / secret manager; per-environment, least privilege

### Authorization → `references/authz.md`
- [ ] Every endpoint and data read authorises the *specific record* server-side, not just "is logged in"
- [ ] Ownership/tenant filter present on every query touching user data
- [ ] No identity claim trusted from the client; tokens verified (signature, exp, aud, iss)
- [ ] No auth logic, price, quantity, or role decision that only exists in the client
- [ ] Admin/internal/staging surfaces are authenticated and not publicly reachable
- [ ] Rate limiting and lockout on login, OTP, password reset; CSRF on cookie-auth mutations
- [ ] Negative test exists: user A cannot read or modify user B's object
- [ ] Session/token *lifecycle* — see `references/session-lifecycle.md` if the app has auth: revocation on logout/ban, role changes reach live tokens, refresh-token reuse detection, `aud` validation, OAuth `state`+PKCE, step-up auth

### Input and injection → `references/injection.md`
- [ ] Parameterised queries everywhere; no string-built SQL
- [ ] No shell string construction; argument arrays only
- [ ] Output escaped per context; no `innerHTML`/`dangerouslySetInnerHTML`/`eval` on user data
- [ ] Paths canonicalised and confined; uploads size-capped, type-verified, stored non-executable
- [ ] Server-side fetches of user URLs allowlisted (SSRF); redirects re-validated
- [ ] Schema validation at every trust boundary; no mass assignment of privileged fields
- [ ] Deserialisation safe; XML entities off; regex checked for catastrophic backtracking

### Data layer → `references/data-layer.md`
- [ ] Database rules deny by default; no `if true`, and no `if signed-in` standing in for ownership
- [ ] Collection-group / cross-collection queries covered by rules
- [ ] Storage buckets scoped per user; signed URLs expire
- [ ] Indexes match actual query patterns; every list query paginated and bounded
- [ ] Constraints, transactions, and migrations present; migrations reversible and run in CI
- [ ] Backups exist and a restore has actually been tested
- [ ] CORS enumerated (not `*` with credentials); security headers set; debug/stack traces off in prod

### Dependencies → `references/supply-chain.md`
- [ ] Every AI-suggested package verified to genuinely exist with real maintainers and history (slopsquatting)
- [ ] Lockfile committed; CI installs frozen; vulnerability audit is a blocking gate
- [ ] No dependency added for what the stdlib or an existing dependency already does
- [ ] Licences recorded and compatible with how the app is distributed

### Reliability → `references/reliability.md`
- [ ] No swallowed exceptions (`catch {}`, `except: pass`, `try?`, empty `.catch`)
- [ ] Every external call has a timeout, bounded retry with backoff+jitter, and a defined failure UX
- [ ] Null / empty / boundary / very-large / offline / permission-denied / disk-full paths handled
- [ ] Shared mutable state has one owner (actor, lock, queue); no TOCTOU; no main-thread UI violations
- [ ] Subscriptions, observers, timers, tasks cancelled and torn down where they were created
- [ ] Persisted writes atomic and version-tagged; upgrade path from the previous data format tested
- [ ] Money/mutation endpoints idempotent and transactional
- [ ] Environment parity: no hardcoded local paths/dev config, same DB engine local and prod, config from env with a startup check, prod error path exercised

### Performance → `references/performance.md`
- [ ] No query inside a loop (N+1); no O(n²) where a set/map works
- [ ] Every cache bounded (max size + eviction + TTL); every queue and buffer bounded
- [ ] No unbounded growth: arrays, dictionaries, logs, recursive directory walks
- [ ] Heavy work off the main thread; long operations report progress and can be cancelled
- [ ] Rate limits and per-user quotas on anything that costs money
- [ ] Every agent/LLM loop has a hard max-iteration + max-wallclock bound and a spend ceiling that *terminates*, not just alerts; per-user token quota; serverless spend has an alarm
- [ ] State the expected n for each hot path and confirm it holds at 100×

### Distributed systems and caching → `references/distributed-systems.md`
Run when there is a replica, a cache, a queue, a second service, or a network in the request path.
- [ ] Retries at one tier only, with a retry budget + circuit breaker; deadlines propagated, not per-hop timeouts
- [ ] Overload sheds fast (503 + `Retry-After`) instead of slowing every request; readiness checks exercise critical deps
- [ ] A user's reads after their write are read-your-writes consistent; multi-store writes use an outbox + a reconciliation sweep
- [ ] No distributed lock used for correctness without a fencing token; idempotency is atomic, replayed, body-scoped, expiring
- [ ] Cache fills use single-flight / a lease; TTLs jittered; negative results cached; keys include tenant/locale/auth
- [ ] Queues drop stale work on dequeue and apply backpressure; no wall-clock used for TTL/lease/ordering

### Observability → `references/observability.md`
- [ ] RED metrics per service + USE metrics per resource, as histograms; structured logs with a `trace_id` on every line
- [ ] Alerts page only on symptom conditions tied to an SLO, each with a runbook; not on raw cause thresholds
- [ ] A watchdog / dead-man's-switch on independent infra; an external synthetic probe per critical journey; cert + DNS expiry alerts
- [ ] Metric labels are bounded enums (none from IDs/paths/user input); trace sampling keeps 100% of error traces
- [ ] `DEBUG` not the prod default and never logs bodies; every scheduled job alerts on non-execution

### Privacy and logging → `references/privacy.md`
- [ ] No credentials, tokens, PII, or full payloads in logs, crash reports, or analytics
- [ ] Sensitive local data in keychain/encrypted store, not plain prefs or `localStorage`
- [ ] Standard current crypto only; strong password hashing; CSPRNG for tokens
- [ ] Data collection minimised, retention defined, deletion path implemented
- [ ] Privacy policy / data-safety declaration verified against what the code actually does

### Architecture and debt → `references/debt.md`
- [ ] Duplicated logic collapsed to one owner; the same bug isn't cloned across files
- [ ] Dead code, orphaned files, and abandoned alternate implementations deleted
- [ ] One source of truth per piece of state; layering not leaking (no DB calls from views)
- [ ] Tests assert behaviour, cover the negative cases, and would fail if the logic broke
- [ ] Docs and README describe the app as it exists now

### Rollout and migration safety → `references/rollout-migration.md`
Run when the change includes a schema migration, a feature flag, a config change, or a deploy to
existing production data.
- [ ] Schema changes use expand/contract; `lock_timeout` on migrations; `CREATE INDEX CONCURRENTLY`; backfills batched + resumable
- [ ] The N-1 release still runs against the new schema (CI gate); no `SELECT *` in app code
- [ ] A code-only rollback is safe against the current schema; irreversible effects (sends, charges, deletes) are separately gated + rate-capped
- [ ] Progressive rollout: canary + bake + automated metric gate + auto-rollback; config changes staged like code
- [ ] Every flag has an owner, a removal date, and a tested fail-safe default; no flag key reused; no security control is flag-gated (or it fails closed)
- [ ] The kill switch reads from an independent failure domain and has been exercised

### AI toolchain → `references/toolchain.md`
Run when the repo has `.mcp.json`, `.cursorrules`/`.cursor/`, `CLAUDE.md`, `AGENTS.md`, or defines/uses MCP servers.
- [ ] Every MCP server the repo defines/expects is inventoried: publisher known, version pinned, scope minimal
- [ ] Rules files (`.cursorrules`, `CLAUDE.md`, `AGENTS.md`, `copilot-instructions.md`) and `.mcp.json` reviewed as code; scanned for hidden/zero-width Unicode
- [ ] No auto-execution of project-defined MCP servers; each is explicit opt-in
- [ ] Agent configured not to treat fetched content (READMEs, issues, pages) as instructions

### Platform → `references/platform-macos.md`, `references/platform-mobile-web.md`
- [ ] Load the file for the platform being shipped and run its checklist

### If the app itself calls an LLM → `references/llm-features.md`
- [ ] Tool output and fetched content treated as data, never instructions (prompt injection)
- [ ] Model output validated before it reaches SQL, a shell, HTML, or a file path
- [ ] Irreversible actions confirmed; tool permissions scoped to the task
- [ ] Agent loops bounded by a max step count and a spend ceiling that terminates the run
- [ ] Token/cost ceilings, per-user quotas, timeouts; pinned model IDs still supported

### Release gate → `references/release.md`
- [ ] Load and run before any store submission, notarization, or production deploy

## Reporting format

```
## AI Fix audit — <scope>

**Critical** (exploitable now, or ships user data to strangers)
1. `path/file.ext:42` — <one-sentence defect>
   Scenario: <who does what → what happens>
   Fix: <the change>

**High** / **Medium** / **Low** — same shape

**Unverified** — things that look wrong but I couldn't confirm are reachable

**Checked and clean** — <categories swept with no findings, so the user knows coverage>
```

Always include the "checked and clean" list. A report that only shows findings leaves the user
unable to tell the difference between "nothing there" and "didn't look".

## Judgement

Severity is about consequence, not category. An open database rule on a public menu table is
low; the same rule on a users table is critical. Say which it is and why.

Don't fix by widening. If a check is failing, the fix is to satisfy it, never to disable it —
that instinct is exactly how the code got into this state.

Not every finding must be fixed now. Some are accepted trade-offs. Record the accepted ones with
the reason, so the next audit doesn't re-litigate them and so the ceiling is known.
