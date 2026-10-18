# Claude Optimized Workflow

A shareable Claude Code setup for coding: plugins, skills, hooks, the instructions file
that says when to use each skill, and the MCP servers behind it.

## Layout

| Path | Contents |
|---|---|
| `plugins.md` | coding-relevant plugins and what each is for |
| `mcp/mcp.json` | Firecrawl and GitHub MCP servers (placeholders only, no keys) |
| `workflow/` | `CLAUDE.md`, hooks, skills, commands, sanitized `settings.json` |
| `scripts/export-from-local.sh` | pull the above out of `~/.claude` (skips secrets and Roblox/3D) |
| `scripts/install.sh` | install into someone else's `~/.claude`, with backups |

## Status

`workflow/` is empty. The instructions file, hooks, and the `superpowers` and
`full-stack-dev` plugins live on the author's own machine, not in the cloud session that
created this repo. Populate it with:

    ./scripts/export-from-local.sh --dry-run   # check the list
    ./scripts/export-from-local.sh
    git add -A && git commit -m "Add workflow" && git push

## Secrets

Never commit `.credentials.json` or the `env` block of `settings.json`. The export script
drops both; check the diff anyway.
