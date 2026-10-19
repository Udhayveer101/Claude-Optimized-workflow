# 07 — Supply chain and dependencies

## Slopsquatting
LLMs hallucinate package names. Attackers register the hallucinated names. The developer installs
on the model's recommendation and executes an attacker's post-install script that exfiltrates
credentials.

- Hallucinations are **reproducible**: re-running 500 prompts 10× each, 43% of hallucinated names
  came back on every run — so attackers can farm the name list systematically.
- Unlike typosquatting these are not misspellings, so registry similarity heuristics don't catch
  them. Observed squatted names include plausible ones like `aws-helper-sdk`,
  `fastapi-middleware`. Malicious packages in this class have reached tens of thousands of
  downloads. (Cloud Security Alliance, Trend Micro, FOSSA, Contrast, Aikido.)

## Other AI dependency failures
- Adds a heavy dependency for something the stdlib does (climb the ladder first).
- Pins nothing, or pins to `latest`/`^` and ships without a lockfile.
- Invents version numbers and config keys that don't exist for the real package.
- Uses an abandoned/unmaintained package, or one with a known CVE, because it was popular in
  training data (cutoff-era knowledge).
- Copies a snippet with an incompatible licence (GPL/AGPL into a proprietary app) with no
  attribution — a real distribution blocker.
- Leaves transitive vulnerabilities unaudited; no SBOM.
- Runs `curl … | sh` installers, or fetches build-time scripts from an unpinned URL.

## Rules
1. **Verify every AI-suggested package exists** on the real registry, with a real repo, real
   maintainers, sane download history and recent releases — before installing.
2. Lockfiles committed; hash/integrity verification enabled; CI installs with `--frozen-lockfile`
   / `npm ci`.
3. Automated audit in CI (`npm audit`, `pip-audit`, `cargo audit`, Dependabot/Renovate) as a
   blocking gate for high/critical.
4. Disable post-install scripts where the ecosystem allows (`--ignore-scripts`) for untrusted deps.
5. Record licences; keep an SBOM; check licence compatibility before shipping.
6. No new dependency without justifying it against stdlib and existing deps.
