#!/usr/bin/env bash
# Install this workflow into ~/.claude. Existing files are backed up, never overwritten.
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)/workflow"
DEST="${CLAUDE_HOME:-$HOME/.claude}"
STAMP="$(date +%Y%m%d%H%M%S)"
[ -d "$SRC" ] && [ -n "$(ls -A "$SRC" 2>/dev/null)" ] || { echo "workflow/ is empty; run scripts/export-from-local.sh first"; exit 1; }
mkdir -p "$DEST"
(cd "$SRC" && find . -type f ! -name settings.json | while read -r f; do
  [ -e "$DEST/$f" ] && cp "$DEST/$f" "$DEST/$f.bak.$STAMP"
  mkdir -p "$DEST/$(dirname "$f")"; cp "$f" "$DEST/$f"; done)
[ -f "$SRC/settings.json" ] && echo "settings.json not applied automatically; merge $SRC/settings.json into $DEST/settings.json by hand."
echo "MCP servers: claude mcp add-json firecrawl '<see mcp/mcp.json>' (set FIRECRAWL_API_KEY and GITHUB_PAT first)."
