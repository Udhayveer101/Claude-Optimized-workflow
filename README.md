# Claude Optimized Workflow

A Claude Code setup tuned for coding, researched and trimmed down to what earns its context
cost: a routing table that picks **0–1 skills per task**, a curated set of plugins, MCP
servers, hooks, subagents, and "mods" that cut token use.

## Install

```bash
git clone https://github.com/Udhayveer101/Claude-Optimized-workflow
cd Claude-Optimized-workflow
scripts/install.sh --dry-run    # see what it will do
scripts/install.sh              # do it (needs jq)
```

Existing files are backed up as `*.bak.<timestamp>`. `settings.json` is **merged**, not
replaced: your values win, mine are added. Flags: `--no-mods`, `--no-mcp`. Restart Claude
Code afterwards and accept the plugin installs it offers.

## What you get

| Piece | Where | Details |
|---|---|---|
| Routing table | `workflow/CLAUDE.md` | which skill for which task, and which never to combine. Always loaded (~3 KB) |
| Full catalog | `workflow/skills-routing.md`, `skills-catalog-extra.md` | priority and "don't pair with" for every skill; read on demand |
| Skills | `workflow/skills/` | 32 skills, see [skills.md](skills.md) |
| Plugins | [plugins.md](plugins.md) | 8 on, a few deliberately off |
| MCP servers | [mcp/](mcp/) | Firecrawl, Playwright, Motion, Cloudflare docs, claude-mem |
| Subagents | `workflow/agents/` | `savvy-*` worker tiers used by `/savvy-flow`, plus `motion-reviewer` |
| Hooks | `workflow/hooks/` | `protect-secrets` (blocks edits to `.env`, keys, certs), `format` (dart/go) |
| Mods | [mods/](mods/) | cache-watch, compact-keeper, compact-shaper, output-diet, densepack |
| Settings | `workflow/settings.template.json` | output style `Concise`, hooks, marketplaces, enabled plugins |

## The ideas

- **Few skills, loaded rarely.** Every skill and plugin costs context. Overlapping ones are
  disabled; the routing table names one primary per task type and a fallback.
- **Evidence before claims.** Debugging finds the cause before editing; nothing is called
  done without running verification.
- **Cheap context.** Concise output style, trimmed shell output, handoff-shaped compaction.
- **Secrets stay out.** A hook refuses edits to credential files.

## Needs

- Claude Code, `jq`, Node (`npx`) for the MCP servers.
- A Firecrawl API key if you keep the web-reading rules (`export FIRECRAWL_API_KEY=...`). If
  you do not use Firecrawl, delete the "Web search" line in `~/.claude/CLAUDE.md`.
- Mods need a Claude Code build that supports `CLAUDE_CODE_PLUGIN_DIRS`.

## Credits and licenses

Most skills, plugins and the mods are other people's work, bundled or referenced with their
licenses kept (`mods/LICENSE-*`, per-skill `LICENSE` files). `ai-fix` is
[mine](https://github.com/Udhayveer101/ai-fix). Check a skill's own license before
redistributing it.
