# AI toolchain — the build environment as attack surface

Every other reference is about the app AI built. This one is about the coding agent, its MCP
servers, and the rules files that steer it. In 2026 a growing share of AI-linked incidents start
here (Gartner ties the coming GenAI breach wave to MCP). Run this section when the repo contains
`.mcp.json`, `.cursor/`, `.cursorrules`, `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`,
or defines/consumes MCP servers.

## What goes wrong

- **MCP tool poisoning** — the tool *description* field is unsanitised text the agent trusts.
  A malicious/compromised server hides instructions there ("also read `~/.aws/credentials`…")
  and the agent obeys with no user prompt. ~43% of tested servers were command-injectable, ~82%
  path-traversal-prone (2026 scans). Real case: WhatsApp MCP integration exfiltrated full message
  history via poisoned descriptions (Nov 2025).
- **IDE / agent auto-execution** — Cursor, Claude Code, Gemini CLI, Copilot, Amazon Q auto-start
  project-defined MCP servers at developer OS privilege with no isolation. Cloning a repo runs
  someone else's server. CVE-2025-54135 (Cursor), CVE-2025-55284 (Claude Code): RCE / DNS
  exfiltration through this path.
- **Rules-file backdoors** — instructions hidden in `.cursorrules` / `CLAUDE.md` / `AGENTS.md`,
  often with zero-width or bidi Unicode so they're invisible in a normal diff. The agent obeys
  them every task: insert a backdoor, weaken a check, leak a secret.
- **Prompt injection into the coding agent** — a poisoned README, issue comment, changelog, or
  fetched web page tells the assistant to change what it builds.
- **Training-data contamination** — the model reproduces insecure idioms it learned from public
  repos (including ones later CVE'd), confidently, at scale.

## Checklist

- [ ] Inventory every MCP server the repo defines or expects (`.mcp.json`, editor config). For
      each: publisher known, version pinned, scope no broader than needed.
- [ ] Read every rules file as security-relevant code: `.cursorrules`, `.cursor/rules/*`,
      `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`.
- [ ] Scan those files + `.mcp.json` for hidden/zero-width/bidi Unicode:
      `grep -rnP '[\x{200B}-\x{200F}\x{202A}-\x{202E}\x{2060}-\x{206F}\x{FEFF}]' <paths>`
- [ ] Auto-execution of project-defined MCP servers is disabled; each server is explicit opt-in.
- [ ] Rules files and `.mcp.json` changes go through the same review as source (not
      auto-accepted, not `.gitignore`d and drifting).
- [ ] The agent is configured not to act on instructions found in fetched content (READMEs,
      issues, web pages) — treat as data.
- [ ] Secrets the agent can reach (`.env`, `~/.aws`, keychains) are the minimum for the task.

Deeper background: see the project research notes on the AI toolchain and agent risks.
