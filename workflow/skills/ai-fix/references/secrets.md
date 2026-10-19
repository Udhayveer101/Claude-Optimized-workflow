# 03 — Secrets and credentials

The single most common vibe-coding finding. 400 exposed secrets in a 5,600-app scan; 11% of
indie launches leak Supabase credentials in the frontend.

## What AI does
- Hardcodes API keys, DB URLs, tokens, passwords directly in source so the example "just works".
- Puts secrets in **client-side** code: JS bundles, `NEXT_PUBLIC_*`, Vite `VITE_*`, mobile app
  binaries, Info.plist, Android `strings.xml`, compiled Swift string literals.
- Confuses public/anon keys with privileged keys — ships `service_role` / admin / server keys to
  the browser, which bypasses every database policy.
- Commits `.env`, `.env.local`, `serviceAccount.json`, `.pem`, keystores, provisioning profiles.
- Writes `.gitignore` *after* the first commit, leaving secrets in git history forever.
- Prints secrets in log lines, error messages, crash reports, and debug dumps.
- Embeds secrets in CI YAML, Dockerfiles, `docker-compose.yml`, Terraform state.
- Re-adds a removed key during a later refactor because the failing call was "fixed".

## Non-negotiable rules
1. **Anything shipped to a client is public.** Obfuscation, base64, and env-var indirection at
   build time do not change this. If the value must stay secret, it lives on a server.
2. Secrets come from env / OS keychain / secret manager at runtime, never from source.
3. Any secret that ever touched a repo, a log, or a bundle is **burned** — rotate it, don't just
   delete it. Removing the line does not remove it from git history or from caches/CDNs.
4. Separate keys per environment; least-privilege scope per key.
5. Client-facing third-party APIs go through a backend proxy / edge function that holds the key.
6. Secret scanning in CI (gitleaks/trufflehog + provider push protection) — treat as blocking.

## Checks to run
- `git log -p | grep -Ei 'api[_-]?key|secret|token|password|BEGIN .*PRIVATE KEY'`
- grep the **built bundle**, not the source: `grep -r "sk-\|service_role\|AIza\|AKIA" dist/`
- `strings` the compiled binary / `.app` / `.apk` for key-shaped literals.
- Confirm `.gitignore` covers env, keys, keystores, `*.mobileprovision`, `*.p8`, `*.p12`.
