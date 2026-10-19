# Mods

Claude Code plugin-dir mods, loaded with `CLAUDE_CODE_PLUGIN_DIRS` (the installer sets it).
`cache-watch`, `compact-keeper`, `compact-shaper`, `output-diet` come from
[claude-mods](LICENSE-claude-mods) (MIT, Michael Prömpler); `densepack` from
[claude-pro-kit](LICENSE-claude-pro-kit) (MIT, Vedant Andhale). Both are their work, bundled
here unmodified so one install gets everything.

| Mod | Effect |
|---|---|
| cache-watch | live panel for prompt cache, limits and context; one-press handoff before the cache goes cold |
| compact-keeper | after a compaction, re-adds exact facts: latest prompts, edited files, todo list, last failed command (max 4,000 chars, no model calls) |
| compact-shaper | compaction summarized as a handoff; `/compact prune` cuts re-readable tool output instead |
| output-diet | trims long shell, Grep and subagent output before Claude reads it; full text saved to a file |
| densepack | optional: packs big Reads and reports into dense images for fewer input tokens; off until `touch ~/.claude/densepack-on` |

`effortless-best-model.patch` is my patch for the `effortless` plugin (v1.71.0) adding a
"best for the task" model router. Apply with `patch -p1 -d <plugin dir> < effortless-best-model.patch`;
a plugin update overwrites it.

Mods need a Claude Code build that supports `CLAUDE_CODE_PLUGIN_DIRS`. They are optional:
skip with `install.sh --no-mods`.
