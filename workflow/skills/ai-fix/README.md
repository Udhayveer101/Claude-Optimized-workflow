# ai-fix

A [Claude Code](https://claude.com/claude-code) skill that audits and hardens apps built with AI
assistance ("vibe coded") against the failure classes AI systematically misses: exposed secrets,
missing authorization, injection, open database rules, hallucinated dependencies, swallowed
errors, race conditions, unbounded caches and leaks, N+1 queries, runaway agent/LLM cost,
environment mismatch, AI-toolchain / MCP risks, session and token lifecycle gaps, missing
observability, distributed-systems and caching failure modes, unsafe schema migrations and
rollouts, privacy and logging leaks, platform hardening, and release blockers.

## Install

Copy this directory into your skills folder:

```bash
git clone https://github.com/Udhayveer101/ai-fix ~/.claude/skills/ai-fix
```

Claude Code picks it up automatically. Invoke it by asking to review, audit, harden, or ship an
app — or run the quick grep pass directly:

```bash
bash ~/.claude/skills/ai-fix/scripts/quickscan.sh path/to/project
```

## Layout

- `SKILL.md` — the audit workflow and the full checklist
- `references/` — one file per category, loaded on demand (secrets, authz, session-lifecycle,
  injection, data-layer, supply-chain, reliability, distributed-systems, performance,
  observability, rollout-migration, privacy, debt, toolchain, platform, llm-features, release),
  plus `evidence.md` for the supporting statistics
- `scripts/quickscan.sh` — read-only grep sweep for the textually visible failure classes

## License

MIT — see [LICENSE](LICENSE).
