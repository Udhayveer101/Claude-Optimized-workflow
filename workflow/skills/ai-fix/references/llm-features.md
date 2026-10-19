# 14 — When the app itself uses an LLM

Distinct from "the app was built by an LLM". Both apply if you ship AI features.
Reference: OWASP Top 10 for LLM Applications (2025) and the OWASP Agentic AI Top 10 (2026).

- **Prompt injection** (direct and indirect) — untrusted content (web pages, files, emails, tool
  output, user uploads) treated as instructions. Everything the model reads via a tool is data,
  never a command.
- **Improper output handling** — model output piped into SQL, a shell, `eval`, HTML, or a file
  path without validation. Treat model output as hostile user input.
- **Excessive agency** — tools with broader permissions than the task needs; irreversible actions
  (delete, send, pay, publish) executed without confirmation; no allowlist of callable tools.
- **Sensitive information disclosure** — user data, secrets, or other tenants' data placed in
  prompts or leaked in completions; system-prompt leakage treated as a secret store (it isn't).
- **Unbounded consumption** — no token caps, no per-user quotas, no timeout, no cost ceiling; an
  abusive prompt loop becomes an unbounded bill. Cache and rate-limit.
- **Supply chain / model risk** — pinned model IDs that get retired (a real, repeated failure:
  vendors deprecate models fast and a 404 is not a quota error), unvetted third-party
  prompts/plugins/MCP servers.
- **Misinformation / hallucination surfaced as fact** — no grounding, no citation, no confidence
  handling, no human-in-the-loop for consequential outputs.
- **No logging/eval** of prompts and outcomes; no regression tests for prompt changes; no
  safety/abuse filtering; no way to reproduce a bad output.
- Secrets in prompts; PII sent to a third-party model without disclosure or consent.
