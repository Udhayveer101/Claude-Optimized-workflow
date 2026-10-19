# 10 — Technical debt and architecture

GitClear on 211M LOC: duplicated blocks up 8×, refactoring down from 25% to under 10% of changes,
churn +39% in AI-heavy projects. "Highly functional but systematically lacking architectural
judgment."

## What accumulates
- **Duplication instead of extraction** — the same logic in 6 files; fixing a bug in one leaves
  five. Duplicated *bug* patterns across files appear in 80–90% of repos studied.
- Dead code, orphaned files, unused exports, half-finished alternate implementations left behind
  from earlier attempts ("v2" next to "v1", both wired up).
- Two sources of truth for the same state; drifting parallel models.
- Excessive/obvious comments (90–100% of repos) that restate the code and rot immediately.
- Inconsistent conventions per file — naming, error style, layering — because each generation
  reset context.
- Speculative abstractions with one implementation; config values that never change.
- Leaky layering: UI files talking to the database; business rules in view code; platform calls
  scattered instead of behind one adapter.
- Silent behaviour drift: a later prompt changed a shared function's semantics for one caller.
- No tests, or tests that assert the implementation rather than the behaviour, or tests written
  by the same model that wrote the bug (co-hallucination).
- Tests mocked so thoroughly they'd pass with the function deleted. (43% of AI code changes
  still needed extra debugging after deployment — Lightrun 2026 — despite "passing" tests.)
- No CI; or CI that doesn't actually run the tests it claims to.
- README/docs describing a version of the app that no longer exists.
- Feature flags added and never removed; commented-out code kept "just in case".

## Rules
1. After any AI-built feature: grep for duplicated logic and collapse it to one owner.
2. Every fix goes at the shared root, then verify every caller.
3. Delete dead code aggressively — it is the cheapest security and clarity win available.
4. One runnable check per non-trivial behaviour, asserting behaviour, failing if logic breaks.
5. Docs and code reviewed as a pair; a stale doc is a bug.
