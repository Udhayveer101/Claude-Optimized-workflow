#!/bin/bash
# PostToolUse Edit|Write|MultiEdit: format the touched file. Silent on success.
f=$(jq -r '.tool_input.file_path // empty'); [ -f "$f" ] || exit 0
case "$f" in
  *.dart) command -v dart >/dev/null && dart format "$f" >/dev/null 2>&1 ;;
  *.go)   command -v gofmt >/dev/null && gofmt -w "$f" ;;
esac
exit 0
