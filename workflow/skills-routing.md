# Skills & Plugins — Catalog with Priority + Strength

> **2026-10-14:** `superpowers` plugin and `caveman` plugin/hook disabled. Kept as standalone skills: `systematic-debugging`, `verification-before-completion`, `writing-plans`, `caveman-compress`. Other `superpowers:*` / `caveman*` entries below are inert (copies in `skills-disabled/`). `tesseract-*` are user-invoked only.


> **Trimmed 2026-09-25:** unused skills moved to `~/.claude/skills-disabled/` (P3 firecrawl business workflows, caveman-cloud, grill-me, find-skills, git-commit, agent-development, context-window-management, and user-skill duplicates of superpowers). Plugins off: fullstack-dev-skills, playground, mcpmarket-me, claude-code-setup. Restore: `mv ~/.claude/skills-disabled/<name> ~/.claude/skills/` or flip the plugin to true in settings.json.

Companion to the routing table in `~/.claude/CLAUDE.md`. Not auto-loaded since
2026-10-02; read on demand. Where this file and `CLAUDE.md` disagree, `CLAUDE.md`
wins. Each entry:
**priority · strength (the one thing it's for) · don't-pair-with**.

Priority tiers:
- **P0** always on (background posture).
- **P1** auto-load when the trigger matches — one primary per task type.
- **P2** load only when the task is genuinely deep in that domain; otherwise a
  few lines of direct work beats loading it.
- **P3** explicit user request only; ask first for the ones that spend money or
  hit external services.

Golden rule: a typical task loads **0–1 skills beyond P0**. Never stack two
skills that do the same job — the table below marks which ones collide.

---

## P0 — always on

| Skill | Strength |
|---|---|
| `ponytail` | Laziness ladder — smallest correct change, terse output. |
| `caveman` (full) | Terse prose, no filler. Auto-injected by SessionStart hook. |
| `andrej-karpathy-skills:karpathy-guidelines` | Surgical edits, surface assumptions, verifiable success criteria. |

Not a per-task load — they shape every response already.

---

## P1 — one primary per task type

### superpowers@superpowers-dev
- **Strength:** the process spine. Sub-skills own distinct phases, so they chain
  rather than overlap:
  - `brainstorming` → before any "let's build" (also before plan mode).
  - `writing-plans` → spec/requirements → step plan.
  - `test-driven-development` → before implementation code.
  - `systematic-debugging` → **the** debugging skill; any bug/failure before a fix.
  - `verification-before-completion` → before any "done/fixed/passing" claim.
  - `requesting-code-review` / `receiving-code-review` → finished a branch.
  - `executing-plans` / `subagent-driven-development` → run an approved plan.
  - `using-git-worktrees`, `finishing-a-development-branch`,
    `dispatching-parallel-agents`, `writing-skills` → as named.
- **Don't pair with:** the duplicate user skills of the same name — always this
  version. Don't run `brainstorming` for a one-file change.

### graphify (`/graphify`)
- **P1 · Strength:** persistent knowledge graph of a codebase/corpus — god
  nodes, communities, path/explain queries.
- **Use when:** `graphify-out/` exists, or architecture / "how does X relate to
  Y" questions on a large codebase.
- **Don't pair with:** `claude-mem:smart-explore` or Explore agents — it's the
  first rung of a strict fallback chain (graphify → smart-explore → Explore).

### claude-mem@thedotmack
- **P1 · Strength:** `mem-search` recalls past work/decisions on this project.
  `smart-explore` / `pathfinder` map unfamiliar code **when no graphify graph
  exists**.
- **Also:** `standup`, `timeline-report`, `weekly-digests` (P3, on request).
- **Don't pair with:** graphify (fallback order), or a manual grep sweep when
  `mem-search` answers it.

### code-review@claude-plugins-official
- **P1 · Strength:** `/code-review` = correctness + reuse/simplification/
  efficiency on a diff or PR. `/simplify` = quality-only, no bug hunt.
- **Don't pair with:** `code-reviewer` user skill (use that only when there's no
  diff/PR), `ai-fix` (different job — see below), or a second review skill.
  Pick one.

### code-reviewer (user skill)
- **P1 fallback · Strength:** multi-language review **without** a PR/diff context
  (TS/JS/Py/Swift/Kotlin/Go) — analysis, best practices, security scan.
- **Don't pair with:** `/code-review` (prefer that whenever a diff exists).

### ai-fix (user skill)
- **P1 · Strength:** the failure classes AI-written code systematically ships —
  exposed secrets, missing authz, injection, open DB rules, hallucinated deps,
  swallowed errors, races, leaks, runaway LLM cost, release blockers.
- **Use when:** "harden / audit / make sure nothing's wrong / pre-ship" an
  AI-built app, or just finished a feature Claude wrote.
- **Don't pair with:** `/code-review` (that's correctness, not a security audit),

### ui-ux-pro-max@ui-ux-pro-max-skill
- **P1 · Strength:** the primary UI skill — styles, palettes, font pairings, UX
  guidelines, per-stack code. Sub: `design`, `design-system`, `ui-styling`,
  `brand`, `banner-design`, `slides`.
- **Don't pair with:** `frontend-design` by default (add it only for a
  blank-slate aesthetic direction), `impeccable` (P2, dramatic-redesign only).

### frontend-design@claude-plugins-official
- **P1 add-on · Strength:** aesthetic direction / typography that doesn't read as
  templated — only when starting a UI from nothing.
- **Don't pair with:** `impeccable`; and don't add on top of `ui-ux-pro-max` for
  routine restyles.

### web-design-guidelines (user skill)
- **P1 · Strength:** review existing UI code against Web Interface Guidelines
  (accessibility, UX). Review-only.
- **Don't pair with:** the build skills above — this is the "check my UI" path.

### dataviz (bundled)
- **P1 · Strength:** read before writing ANY chart/graph/dashboard code —
  palette formula, mark specs, light/dark consistency.

### humanizer (user skill / bundled)
- **P1 · Strength:** strip AI-writing tells from prose (blog, email, docs).
- **Don't pair with:** `humanize-writing` — use exactly one.

### humanize-writing (user skill)
- **P1 · Strength:** same job **for academic/scholarly** text (citations,
  hedging, non-native-English considerations).
- **Don't pair with:** `humanizer`.

### claude-api (bundled)
- **P1 · Strength:** authoritative Claude/Anthropic model IDs, pricing, params,
  caching, token counting. Read before answering any such question from memory.

### Lean process skills (user skills, added 2026-09-18)
Narrow, single-phase alternatives to the superpowers spine. Each **replaces**
its superpowers neighbour for that task — never run both.
- `surgical-patch` — **P1** apply a fix/small behavior change at the narrowest
  layer with regression proof. Runs *after* `systematic-debugging` found the cause.
- `safe-refactor` — **P1** structure-only change; verification brackets the edits.
- `migration` — **P1** schema/data/API/protocol/config/dependency transitions
  with rollback + preservation proof.
- `lean-build` — **P1 alt** to the brainstorming→plans→TDD pipeline for a
  small/medium slice with high overbuild risk (strict scope + stop condition).
- `investigate-first` — **P2 alt** to `systematic-debugging` for intermittent
  failures / perf regressions needing evidence-ranked hypotheses.
- `verify-and-stop` — **P1 alt** to `verification-before-completion` when the
  task *is* validation (no new scope).
- `research` — **P1** research a question against primary sources → Markdown
  file in the repo (can run as a background agent).

### firecrawl (user skills + Firecrawl MCP, added 2026-09-05)
- **P1 · Strength:** the default live-web layer — beats WebFetch/WebSearch on
  JS-rendered pages and returns full content.
  - `firecrawl-search` → no URL known. `firecrawl-scrape` → URL given.
  - `firecrawl-developer-index` → "how does lib X behave / what does this error
    mean / was this bug fixed" (issues, PRs, READMEs).
  - `firecrawl-parse` → local PDF/DOCX/XLSX/HTML → markdown.
  - `firecrawl-research-papers` / `-research-index` → published papers
    (biomed-heavy + arXiv). Finds papers; `academic-research-skills` *writes* them.
  - `firecrawl-deep-research` → formal cited report (only when asked for one).
- **P2:** `firecrawl-crawl` (many pages), `-map` (site URLs), `-agent`
  (schema → JSON), `-interact` (click/login/paginate), `-download` (offline copy),
  `-knowledge-base` / `-knowledge-ingest` (RAG corpus).
- **P3 💸:** `firecrawl-workflows`, `-lead-gen`, `-lead-research`,
  `-company-directories`, `-competitive-intel`, `-market-research`,
  `-seo-audit`, `-qa`, `-shop`, `-demo-walkthrough`, `-dashboard-reporting`,
  `-website-design-clone`, `-monitor`.
- **Don't pair with:** `agent-browser` / Claude Browser for plain reads;
  `firecrawl` umbrella + a sub-skill (pick the sub-skill).

---


---

P2/P3 skills, MCP ownership table and downgrade notes live in `~/.claude/skills-catalog-extra.md` (not auto-loaded) — read it only when a task falls outside P1.
