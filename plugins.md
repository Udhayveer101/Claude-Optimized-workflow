# Plugins

`install.sh` adds the marketplaces and enables the **on** plugins through `settings.json`;
Claude Code installs them on next start.

## On

| Plugin | Marketplace | What it does |
|---|---|---|
| ponytail | DietrichGebert/ponytail | laziness ladder: smallest correct change, terse output |
| claude-mem | thedotmack/claude-mem | persistent memory across sessions + `mem-search`, `smart-explore` |
| ui-ux-pro-max | nextlevelbuilder/ui-ux-pro-max-skill | the UI/UX skill: styles, palettes, fonts, per-stack code |
| frontend-design | anthropics/claude-plugins-official | distinctive visual direction for blank-slate UI |
| code-review | anthropics/claude-plugins-official | `/code-review` for PRs and diffs |
| andrej-karpathy-skills | multica-ai/andrej-karpathy-skills | surgical edits, surface assumptions, verifiable goals |
| cloudflare | cloudflare/skills | Workers, wrangler, Durable Objects, web-perf, docs MCP |
| effortless | HeyCubit/effortless | effort/model routing (see `mods/effortless-best-model.patch`) |

## Off (installed, disabled to save context)

`superpowers` (obra/superpowers; its `systematic-debugging`, `verification-before-completion`
and `writing-plans` are kept as standalone skills), `fullstack-dev-skills`
(Jeffallan/claude-skills), `playground`, `claude-code-setup`, `caveman`.

## Optional, from the Claude desktop app

`engineering`, `design`, `impeccable`, `pdf-viewer`, `watch`, `humanizer`, `legal`. In the
routing table these lose to the standalone skills in `workflow/skills/`.
