# Skill routing

A typical task loads 0–1 skills. Skip a skill when a few lines of direct work settle it faster.
Never run two skills that do the same job. A fallback fires only when the primary's precondition fails.

| Task | Use | Notes |
|---|---|---|
| new feature | `lean-build` | `writing-plans` only for a large multi-file feature or on request. One-file change: no skill. |
| bug / test failure / unexpected behavior | `systematic-debugging` | `investigate-first` instead for intermittent failures or perf regressions. |
| applying a known fix | `surgical-patch` | After the cause is found. |
| refactor, behavior preserved | `safe-refactor` | |
| schema / data / API / dependency migration | `migration` | |
| before claiming done, or pre-commit | `verification-before-completion` | `verify-and-stop` instead when the whole task is validation. |
| review a PR or diff | `/code-review` | `/simplify` if quality-only. `code-reviewer` only when no diff exists. |
| harden / audit / pre-ship | `ai-fix` |  Not also `/code-review`. |
| understand unfamiliar code | `graphify` if `graphify-out/` exists | Else `claude-mem:smart-explore`, else an Explore agent. One, in that order. |
| recall past work on a project | `claude-mem:mem-search` | |
| build or restyle UI | `ui-ux-pro-max:ui-ux-pro-max` | Add `frontend-design` only for a blank-slate aesthetic. `impeccable` only for a dramatic redesign. |
| review existing UI / accessibility | `web-design-guidelines` | |
| text reads as AI-generated | `humanizer` | `humanize-writing` instead for academic text. |
| large read-heavy task (many big files, architecture read, code trace, long subagent reports) | DensePack (`~/mods/densepack`, off by default) | Optional. Enable with `touch ~/.claude/densepack-on`, then read `~/mods/densepack/rules/STYLE-RULES.md` once. Disable with `rm ~/.claude/densepack-on` when done. Skip for small tasks. Never run /bakpack; never pack CLAUDE.md or memory. Bash hooks are removed (output-diet owns Bash). |
| research a topic into a Markdown note | `research` | Papers: `firecrawl-research-papers`. Formal cited report: `firecrawl-deep-research`. |

# Tools

- Web search or reading a URL: use the Firecrawl MCP tools directly, not WebFetch/WebSearch (requires a Firecrawl API key). Library, API, or error questions: `firecrawl_developer_search`.
- A connected MCP beats a skill that shells out for the same job.
- Memory: claude-mem is the primary store. Search it (`claude-mem:mem-search`, smart_search) before re-deriving past work.
- Ask before anything that spends money or calls a paid external API (3D generation, Vercel `buy_*`, scheduled cloud agents).
- Desktop-plugin duplicates (`engineering:*`, `design:*`, `humanizer:humanizer`, `anthropic-skills:humanizer`) lose to the skills in the table.

Full catalog, not auto-loaded: `~/.claude/skills-routing.md` and `~/.claude/skills-catalog-extra.md`. Read only when a task falls outside the table.
