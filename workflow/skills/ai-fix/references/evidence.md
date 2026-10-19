# 02 — Hard numbers

| Finding | Figure | Source |
|---|---|---|
| GenAI picks the insecure option when given a choice | **45%** of tasks | Veracode GenAI Code Security Report 2025 (80 tasks × 100+ models) |
| Failure to defend against XSS (CWE-80) | **86%** of relevant samples | Veracode 2025 |
| Java security failure rate | **>70%** | Veracode 2025 |
| Security performance vs model size/recency | **flat** — models got better at *functional* code, not *secure* code | Veracode 2025 / Spring 2026 update |
| AI code flaw rate vs human-written | **2.74×** | industry analysis 2026 |
| AI-generated code passing security review | **~10.5%** (61% functionally correct) | 2026 aggregate analysis |
| Vibe-coded apps scanned publicly | 5,600 apps → **2,000 critical vulns, 400 exposed secrets, 175 PII exposures** | public scan 2026 |
| Orgs using vibe-coding platforms with systemic risk | **20%** | Wiz Research |
| Indie launch URLs exposing Supabase credentials in frontend | **11%** of 20,000+ | 2026 scan |
| Code duplication | **8× rise** in duplicated blocks (2024); copy-paste 8.3% → 12.3% of changes | GitClear (211M LOC) |
| Refactoring activity | **25% → <10%** of changes | GitClear |
| Code churn (reverted/rewritten within 2 weeks) | **+39%** in AI-heavy projects | GitClear (100M+ LOC) |
| Error-handling gaps in AI PRs vs human PRs | **~2×** | CodeRabbit AI vs Human report |
| Share of all code now AI-generated/assisted | **42%** | Sonar developer survey |
| CVEs directly attributed to AI-generated code | 6 (Jan 2026) → 15 (Feb) → **35 (Mar)** | 2026 CVE analysis |
| Hallucinated package names that repeat across runs | **43%** reproduced on all 10 re-runs of 500 prompts | slopsquatting research |

Use these to justify why the checklist exists — not as a rhetorical flourish.

## Aug 2026 refresh

| Finding | Figure | Source |
|---|---|---|
| Functionally correct vs passes security review | **61%** / **10.5%** | CMU (via OX Security) |
| Log-injection defense failure | **88%** | Georgetown CSET / Veracode |
| New Java code security failure | **72%** | Veracode 2026 |
| XSS vulns vs human code | **2.74×** | CodeRabbit, State of AI vs Human Code Generation |
| Hallucinated package references | **19.7%** of 2.23M samples (commercial **5.2%** / OSS **21.7%**); **43%** recur every rerun | slopsquatting research (via Cycode) |
| Iterative refinement → critical vulns | **+37%** after 5 rounds | Iterasec / arXiv 2506.11022 |
| Privilege-escalation findings YoY | **+322%** | 2026 vuln-class analysis |
| Architectural-design flaws YoY | **+153%** | 2026 vuln-class analysis |
| AI-introduced CVEs tracked | 6 (early 2025) → **74** (Mar 2026) | Georgia Tech Research / Vibe Security Radar |
| AI changes needing extra debugging post-deploy | **43%** | Lightrun 2026 survey |
| AI-assisted repos leaking API keys | **~40%** more likely | GitGuardian (via Cycode) |
| Apps with CSRF protection / security headers | **0 of 15** | Tenzai (via OX Security) |
| Projected prompt-to-app defect increase by 2028 | **+2500%** | Gartner |
| Runaway agent tool-call loop | **≈$3,700 / 3h**; $250 cap → **$10,138** overnight, no alert | CIO / Render / Oplexa 2026 |

**Real-world incidents** (root cause → exact AI mistake → checklist line): Moltbook (RLS never
enabled → anon key = admin), Lovable/CVE-2025-48757 (inverted access-control conditional, 170
apps), Base44 (register/OTP endpoints with no auth), Orchids (generated code run unsandboxed →
zero-click RCE), Replit agent (deleted 1,206 records during a code freeze), Enrichlead
(subscription check client-side only), Escape.tech scan (2,000+ vulns / 400 secrets / 175 PII
across 5,600 apps), Cursor CVE-2025-54135 / Claude Code CVE-2025-55284 (IDE auto-exec of project
MCP config). See the project research notes for the full incident catalog with sources.

## Classic postmortems — what a "generate → run → it renders" workflow can't see

| Incident | Figure | Blind spot |
|---|---|---|
| Knight Capital 2012 — deploy to 7/8 servers, a repurposed retired flag ran dead code | **≈$460M** in **~45 min** | flag lifecycle; "it deployed" ≠ "deployed everywhere" |
| tj-actions/changed-files 2025 (CVE-2025-30066) — tags `v1`–`v45.0.7` repointed, CI secrets to public logs | **>23,000** repos | trust a mutable tag; a CI step sees every secret |
| GitLab.com 2017 — primary DB wiped, then every recovery path failed | **5 of 5** backup methods broken; **~6 h** lost | "backup job scheduled" ≠ "backup restorable" |
| Cloudflare 2019 — a WAF regex backtracked super-linearly on non-matching input | **~27 min** global, all cores 100% CPU | AI checks a regex *matches*, not that it *fails cheaply* |
| GitHub 2018 — a brief network blip triggered a cross-region DB split-brain | **43 s** partition → **24 h+** degraded | "it fails over" ≠ "it recovers cleanly" |
| Config changes as a share of major-incident impact | **the majority** (~70% in some analyses) | config shipped with less rigor than code |

The five shapes AI can't see from source: **time** (expiry, clock rollover, a cron that dies on
day 8), **scale** (emergent at fleet size N), **blast radius of a config/flag** (the code is
fine; the change is the incident), **recovery never rehearsed** (backups, failover, out-of-band
access), **toolchain trust** (dependencies, CI, Actions, `curl | bash`).
