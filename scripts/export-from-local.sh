#!/usr/bin/env bash
# Copy the real workflow from ~/.claude into this repo, minus secrets and anything
# Roblox / 3D related. Run from the repo root. Use --dry-run to list what would be copied.
set -euo pipefail

SRC="${CLAUDE_HOME:-$HOME/.claude}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/workflow"
EXCLUDE='roblox|rbx|luau|mesh|3d|blender|studio'
DRY=0; [ "${1:-}" = "--dry-run" ] && DRY=1

copy() { # $1 = path relative to $SRC
  [ -e "$SRC/$1" ] || { echo "skip (missing): $1"; return; }
  echo "copy: $1"
  [ "$DRY" = 1 ] && return
  mkdir -p "$DEST/$(dirname "$1")"
  if [ -d "$SRC/$1" ]; then
    (cd "$SRC" && find "$1" -type f | { grep -Eiv "$EXCLUDE" || true; } | while read -r f; do
      mkdir -p "$DEST/$(dirname "$f")"; cp "$f" "$DEST/$f"; done)
  else
    cp "$SRC/$1" "$DEST/$1"
  fi
}

for p in CLAUDE.md hooks skills commands agents output-styles; do copy "$p"; done

# settings.json: keep hooks, plugin enablement, marketplaces, permissions; drop env (secrets).
if [ -f "$SRC/settings.json" ]; then
  echo "copy (sanitized): settings.json"
  if [ "$DRY" = 0 ]; then
    command -v jq >/dev/null || { echo "jq required"; exit 1; }
    jq 'del(.env) | with_entries(select(.key|test("^(hooks|enabledPlugins|extraKnownMarketplaces|permissions|statusLine|model)$")))' \
      "$SRC/settings.json" > "$DEST/settings.json"
  fi
fi
echo "Review $DEST for secrets and Roblox leftovers before committing."
