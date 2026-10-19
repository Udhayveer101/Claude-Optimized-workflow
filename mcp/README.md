# MCP servers

| Server | Purpose | Needs |
|---|---|---|
| firecrawl | web search, scrape, crawl, paper search. `CLAUDE.md` routes all web reading here | `FIRECRAWL_API_KEY` (paid) |
| playwright | headless browser testing | nothing |
| motion | Motion (animation library) docs and examples | nothing |
| cloudflare-docs | Cloudflare documentation search | nothing |
| claude-mem | persistent cross-session memory | ships with the `claude-mem` plugin, no setup |

`install.sh` registers the first four with `claude mcp add-json`. Optional extras I also
use but do not auto-install: Vercel, Playwright alternatives, `rea-agents` (reverse
engineering), `motion-plus` (paid, OAuth).
