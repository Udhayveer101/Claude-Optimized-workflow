#!/usr/bin/env bash
# Install this workflow into ~/.claude. Nothing is overwritten without a timestamped backup.
# Usage: scripts/install.sh [--dry-run] [--no-mods] [--no-mcp]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${CLAUDE_HOME:-$HOME/.claude}"
STAMP="$(date +%Y%m%d%H%M%S)"
DRY=0; MODS=1; MCP=1
for a in "$@"; do case "$a" in
  --dry-run) DRY=1;; --no-mods) MODS=0;; --no-mcp) MCP=0;;
  *) echo "unknown option: $a"; exit 1;; esac; done
command -v jq >/dev/null || { echo "jq is required (brew install jq)"; exit 1; }
run() { if [ "$DRY" = 1 ]; then echo "[dry-run] $*"; else "$@"; fi; }

backup() { [ -e "$1" ] && run cp -R "$1" "$1.bak.$STAMP" || true; }

# 1. skills, agents, hooks, instruction files
run mkdir -p "$DEST/skills" "$DEST/agents" "$DEST/hooks"
for d in skills agents hooks; do
  for src in "$ROOT/workflow/$d"/*; do
    name="$(basename "$src")"; backup "$DEST/$d/$name"
    run cp -R "$src" "$DEST/$d/"
  done
done
run chmod +x "$DEST"/hooks/*.sh
for f in CLAUDE.md skills-routing.md skills-catalog-extra.md; do
  backup "$DEST/$f"; run cp "$ROOT/workflow/$f" "$DEST/$f"
done

# 2. mods
MODDIR="$DEST/mods"
if [ "$MODS" = 1 ]; then
  run mkdir -p "$MODDIR"
  for m in cache-watch compact-keeper compact-shaper output-diet densepack; do
    run rm -rf "$MODDIR/$m"; run cp -R "$ROOT/mods/$m" "$MODDIR/$m"
  done
  run cp "$ROOT"/mods/LICENSE-* "$ROOT"/mods/effortless-best-model.patch "$MODDIR/"
fi

# 3. merge settings.json (existing values win for scalars; hooks, plugins, marketplaces are unioned)
SET="$DEST/settings.json"
[ -f "$SET" ] || { [ "$DRY" = 1 ] || echo '{}' > "$SET"; }
backup "$SET"
PLUGDIRS=""
[ "$MODS" = 1 ] && PLUGDIRS="$MODDIR/cache-watch:$MODDIR/compact-shaper:$MODDIR/compact-keeper:$MODDIR/output-diet:$MODDIR/densepack"
if [ "$DRY" = 0 ]; then
  jq --slurpfile t "$ROOT/workflow/settings.template.json" --arg dirs "$PLUGDIRS" '
    ($t[0]) as $T
    | .env = (($T.env + (.env // {})))
    | (if $dirs != "" then .env.CLAUDE_CODE_PLUGIN_DIRS = ((((.env.CLAUDE_CODE_PLUGIN_DIRS // "") | split(":")) + ($dirs | split(":"))) | map(select(. != "")) | unique_by(.) | join(":")) else . end)
    | .outputStyle = (.outputStyle // $T.outputStyle)
    | .extraKnownMarketplaces = (($T.extraKnownMarketplaces) + (.extraKnownMarketplaces // {}))
    | .enabledPlugins = (($T.enabledPlugins) + (.enabledPlugins // {}))
    | .hooks.PreToolUse  = ((.hooks.PreToolUse  // []) + $T.hooks.PreToolUse  | unique)
    | .hooks.PostToolUse = ((.hooks.PostToolUse // []) + $T.hooks.PostToolUse | unique)
  ' "$SET" > "$SET.tmp" && mv "$SET.tmp" "$SET"
else
  echo "[dry-run] merge workflow/settings.template.json into $SET"
fi

# 4. MCP servers
if [ "$MCP" = 1 ] && command -v claude >/dev/null; then
  for n in $(jq -r '.mcpServers|keys[]' "$ROOT/mcp/mcp.json"); do
    run claude mcp add-json --scope user "$n" "$(jq -c ".mcpServers[\"$n\"]" "$ROOT/mcp/mcp.json")" || echo "skip $n (already added?)"
  done
fi

cat <<MSG

Done. Remaining by hand:
  - export FIRECRAWL_API_KEY=...   (firecrawl MCP and skills need it; skip if you don't use Firecrawl)
  - restart Claude Code; accept the plugin installs it offers (see plugins.md)
  - optional: patch -p1 -d <effortless plugin dir> < $MODDIR/effortless-best-model.patch
Backups of anything replaced end in .bak.$STAMP
MSG
