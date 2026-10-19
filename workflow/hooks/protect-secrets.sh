#!/bin/bash
# PreToolUse Edit|Write|MultiEdit: refuse edits to secret/credential files.
f=$(jq -r '.tool_input.file_path // empty')
case "$(basename "$f")" in
  .env|.env.*|*.p8|*.p12|*.pem|*.key|GoogleService-Info.plist|google-services.json|.dev.vars)
    [[ "$f" == *.env.example ]] && exit 0
    echo "Blocked: $f is a secrets/credentials file. Ask the user to edit it themselves." >&2; exit 2;;
esac
exit 0
