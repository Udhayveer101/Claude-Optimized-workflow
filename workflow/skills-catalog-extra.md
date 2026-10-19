## P2 — only when genuinely deep in the domain

| Skill | Strength · when it's worth the tokens |
|---|---|
| `vercel-react-best-practices` | React/Next.js perf & bundle work — not for touching one component. |
| `flutter-apply-architecture-best-practices` | Structuring/refactoring a Flutter app into UI/Logic/Data layers. |
| `cloudflare:*` (`agents-sdk`, `workers-best-practices`, `wrangler`, `build-mcp`, `durable-objects`, …) | Any real Workers / Agents SDK / remote-MCP build; biases to CF docs. |
| `impeccable` | Dramatic UI redesign, critique, or polish — not routine styling. |
| `fullstack-dev-skills:<lang>-pro` / `secure-code-guardian` / `test-master` / `database-optimizer` / … | Idiomatic depth in one language/framework that superpowers process skills don't give. Plus a Jira flow (`project:*`) — P3. |
| `artifact-design` (+ `artifact-diagramming`, `artifact-capabilities`) | Writing an Artifact — design pass, diagrams, runtime capabilities. |
| `academic-research-skills:*` (`ars-*`) | Academic papers, lit reviews, peer-review simulation, citation checks. |
| `session-handoff` | Context window near capacity / pausing / resuming a long task. |
| `context-window-management` | Designing something that itself manages an LLM's context. |
| `cavecrew` (caveman plugin) | Delegate locate / 1–2-file edit / diff review to compressed subagents (`cavecrew-investigator`/`-builder`/`-reviewer`) when main context is precious. |
| `caveman-explore` | Haiku read-only explorer returning path:line only — last rung of the explore chain, cheaper than a general Explore agent. |

---

## P3 — explicit request only

Ask first for the ones marked 💸 (spend money / hit external services).

| Skill | Strength |
|---|---|
| `playground` 💸 | Self-contained single-file interactive HTML explorer. |
| `agent-browser` 💸 | Drive a real browser — navigate, fill, scrape, e2e test, Slack. |
| `anthropic-skills:docx` / `pdf` / `pptx` / `xlsx` 💸 | Produce an Office/PDF deliverable. |
| `loop` / `schedule` / `anthropic-skills:schedule` 💸 | Recurring or scheduled tasks / cron agents. |
| `mcpmarket-me:yt-dlp` 💸 | Download video/audio. |
| `git-commit` | Conventional-commit message + staging — only when asked to commit. |
| `claude-code-setup:claude-automation-recommender` | Recommend hooks/subagents/skills/MCP for a repo. |
| `agent-development` / `anthropic-skills:skill-creator` | Build a Claude Code agent / skill / plugin. |
| `find-skills` / `skills` | Discover & install skills / automate version bumps & releases. |
| `grill-me` | Adversarially stress-test an idea or plan. |
| `run` | Launch & drive this project's app to confirm a change works. |
| `caveman` / `caveman-help` / `caveman-stats` | Compressed-output mode, cheat sheet, session token stats. |
| `caveman-compress` / `caveman-learn` | Shrink a memory file / act on a token-sink report. |
| `caveman-commit` | Terse Conventional Commit message (alt to `git-commit`; pick one). |
| `caveman-review` | One-line-per-finding review — only when asked; `/code-review` is primary. |
| `caveman-setup` / `-discover` / `-evidence-review` / `-manage` / `-optimize` 💸 | Caveman Cloud gateway: LLM spend observability & experiments. |
| `legal:*` | Contract review, NDA triage, compliance, vendor check, signature request. |
| `engineering:standup` / `incident-response` / `deploy-checklist` / `system-design` / `tech-debt` / `testing-strategy` / `documentation` / `architecture` | Desktop engineering plugin — only when named; its `code-review`/`debug` lose to the P1 primaries. |
| `design:user-research` / `research-synthesis` / `design-handoff` / `ux-copy` / `design-system` / `design-critique` | Desktop design plugin — only when named; `accessibility-review` loses to `web-design-guidelines`. |
| `pdf-viewer:*` | Open/annotate/sign/fill a PDF interactively. |
| `cowork-plugin-management:*` | Build/customize a Cowork plugin. |
| `anthropic-skills:morning` / `consolidate-memory` / `import-memory` / `explain-usage` / `setup-claude` / `docs` | Desktop utilities — only when asked. |
| `ponytail:ponytail-audit` / `-debt` / `-gain` / `-review` | Ponytail reports on over-engineering / debt. |
| `claude-mem:make-plan` / `do` / `babysit` / `learn-codebase` / `knowledge-agent` / `wowerpoint` / … | claude-mem extras — on request. |


---

## Plugins with no skills (hooks only)

- `headroom@headroom-marketplace` — SessionStart/PreToolUse hook runs
  `headroom init hook ensure`. Nothing to invoke.
- `ponytail`, `claude-mem`, `academic-research-skills` also inject SessionStart
  context — that's why they're "always on"; don't load them again.

---

## MCP servers — which one owns which job

Rule: a connected MCP beats a skill that shells out for the same job. Deferred
tools must be loaded with `ToolSearch` (`select:<name>`) before calling.

| MCP | Use for | Don't use for / notes |
|---|---|---|
| **Claude Browser** (`mcp__Claude_Browser__*`) | Previewing this project's dev server (`preview_start` + `.claude/launch.json`), verifying web UI changes, reading pages that need a real browser. | Plain page reads → firecrawl. Not the user's Chrome. |
| **computer-use** | Native macOS apps (Finder, Settings, Xcode UI, any non-web app). | Web apps (use Browser); terminals (use Bash). Load all tools in one `ToolSearch("computer-use")`. |
| **Firecrawl** (`firecrawl_*`) | Web search, scrape, developer index, research papers. | Same job as firecrawl skills — the skills tell you *how*, the MCP *does* it. |
| **claude-mem** (`mcp-search`) | Past observations, `smart_search/outline/unfold` code maps. | — |
| **Claude Docs** (`mcp__1a59c906…`) | A shared doc the user asks for ("write up a doc"). Skeleton first. | Code-repo docs (write files). |
| **Artifact** tool | Pages/dashboards/reports meant for others; load `artifact-design` first. | Advice the user acts on locally. |
| **visualize** (`show_widget`) | Inline diagram/chart in chat; call `read_me` first. | Shareable pages (Artifact). |
| **cloudflare-docs** (connected) · cloudflare-api/bindings/builds/observability (need auth) | Worker docs; account ops once authed. | Pair with `cloudflare:*` skills. |
| **Gmail** / **Google Calendar** / **Google Drive** | Email, events, Drive files. | Sending/inviting/sharing = ask first. |
| **Microsoft 365** (Outlook/Teams/SharePoint, `mcp__3c67d286…`) | Work mail, calendar, Teams, SharePoint. | Same ask-first rule. |
| **Notion** (`mcp__61076a5a…`) | Notion pages/databases. | — |
| **PowerPoint** | Editing an open .pptx live. | New decks → Artifact quickstart (slides). |
| **pdf-viewer** | Display/annotate/fill PDFs. | — |
| **scheduled-tasks** / `schedule` skill | Local cron-style tasks. | One-off work. |
| **mcp-registry** | Find/suggest a connector the user doesn't have yet. | — |
| **terminal** | Read/run in the user's Terminal pane. | Normal commands → Bash. |

Need auth (unavailable until the user connects them): cloudflare-api/bindings/
builds/observability, design:figma/intercom, engineering:asana/datadog/github/
linear/notion/pagerduty, legal:atlassian/box/docusign/egnyte/slack. Tell the
user to authorize via claude.ai connector settings or `/mcp`; never ask for tokens.

---

## Deliberately downgraded (were overlapping)

- `requesting-code-review`, `systematic-debugging`, `test-driven-development`,
  `writing-plans`, `verification-before-completion` as **user skills** → use the
  `superpowers:` versions instead.
- `frontend-design` → add-on to `ui-ux-pro-max`, not a co-primary.
- `code-reviewer` → fallback to `/code-review`, only when no diff exists.
- `humanize-writing` vs `humanizer` → academic vs general; never both.
- `investigate-first` → alt to `systematic-debugging`; `verify-and-stop` → alt
  to `verification-before-completion`; `lean-build` → alt to the build pipeline.
- `caveman-review` → on request only (`/code-review` primary);
  `caveman-commit` vs `git-commit` → pick one, only when committing.
- `caveman-explore` → last rung after graphify → smart-explore.
- `engineering:code-review` / `engineering:debug` / `design:accessibility-review`
  / `humanizer:humanizer` / `anthropic-skills:humanizer` /
  `anthropic-skills:remove-ai-marks` → desktop-plugin duplicates; the P1
  primaries win.
- `agent-browser` → P3; Claude Browser MCP + firecrawl cover most browser work.
