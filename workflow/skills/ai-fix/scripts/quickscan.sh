#!/usr/bin/env bash
# ai-fix quickscan — cheap first pass for the grep-able failure classes.
# Not a substitute for reading code; it just tells you where to look first.
# Usage: quickscan.sh [dir]   (defaults to .)
# Skips Tests/ and generated output — audit those separately if they ship.
set -uo pipefail
ROOT="${1:-.}"
EX='--exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.build --exclude-dir=build --exclude-dir=dist --exclude-dir=Pods --exclude-dir=vendor --exclude-dir=.venv --exclude-dir=Tests --exclude-dir=graphify-out --exclude-dir=.next'

hdr() { printf '\n===== %s =====\n' "$1"; }
scan() { hdr "$1"; shift; grep -rInE $EX "$1" "$ROOT" 2>/dev/null | head -40 || true; }

scan "Secret-shaped literals"        '(api[_-]?key|secret|passwd|password|token|bearer|private[_-]?key)[[:space:]]*[:=][[:space:]]*["'\''][^"'\'']{8,}'
scan "Known key prefixes"            '(sk-[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{20,}|ghp_[A-Za-z0-9]{20,}|service_role|BEGIN [A-Z ]*PRIVATE KEY)'
scan "Client-exposed env vars"       '(NEXT_PUBLIC_|VITE_|REACT_APP_|EXPO_PUBLIC_)[A-Z0-9_]*(KEY|SECRET|TOKEN|PASSWORD)'
scan "Wide-open rules / CORS"        '(allow .*: *if true|Access-Control-Allow-Origin.*\*|"\*"[[:space:]]*,?[[:space:]]*credentials)'
scan "Auth by presence only"         '(request\.auth *!= *null|if *\(.*isLoggedIn.*\) *\{)'
scan "Swallowed errors"              '(catch *\([^)]*\) *\{ *\}|except[^:]*: *pass|\.catch\( *\(\) *=> *\{? *\}?\)|try\? )'
scan "Injection-prone calls"         '(execute\(.*[%+].*\)|f".*(SELECT|INSERT|UPDATE|DELETE).*\{|shell *= *True|innerHTML *=|dangerouslySetInnerHTML|\beval\(|os\.system\()'
scan "TLS / verification disabled"   '(verify *= *False|rejectUnauthorized *: *false|NSAllowsArbitraryLoads|cleartextTrafficPermitted *= *"true"|InsecureSkipVerify)'
scan "Weak crypto / randomness"      '(\bMD5\b|\bSHA1\b|Math\.random\(\)|ECB)'
scan "Risky entitlements"            '(disable-library-validation|allow-unsigned-executable-memory|allow-dyld-environment-variables|get-task-allow|disable-executable-page-protection)'
scan "Suppressions"                  '(@ts-ignore|eslint-disable|# *noqa|# *type: ignore|SwiftLint:disable|--no-verify)'
scan "Left-behind markers"           '\b(TODO|FIXME|HACK|XXX|hardcoded for now|temporary)\b'
scan "Debug logging"                 '(console\.log\(|print\(|NSLog\(|Log\.d\()'

hdr "Ignored-file coverage"
for f in .env .env.local .gitignore; do [ -e "$ROOT/$f" ] && echo "present: $f"; done
[ -f "$ROOT/.gitignore" ] && grep -nE '\.env|\.p12|\.p8|keystore|mobileprovision|serviceAccount' "$ROOT/.gitignore" || echo "no .gitignore matches for secret files"

hdr "Committed secret-ish files (tracked by git)"
git -C "$ROOT" ls-files 2>/dev/null | grep -iE '(^|/)\.env|serviceAccount|\.p12$|\.p8$|\.pem$|keystore|\.mobileprovision$' | head -20 || true

printf '\nDone. Every hit is a lead, not a finding — confirm reachability before reporting.\n'
