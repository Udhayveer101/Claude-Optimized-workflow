# 12 — Platform specific: macOS desktop apps

Relevant to Swift/AppKit/SwiftUI apps and anything with a helper tool. AI routinely disables these
protections to make a build error disappear.

## Signing, notarization, Gatekeeper
- Hardened Runtime **required** for notarization; notarization required for distribution outside
  the App Store (Gatekeeper staples a ticket).
- Entitlements must be minimal. The dangerous ones AI adds to unblock itself:
  `com.apple.security.cs.disable-library-validation`,
  `disable-executable-page-protection`, `allow-unsigned-executable-memory`,
  `allow-dyld-environment-variables`, `get-task-allow` (debug — must **not** ship),
  `com.apple.security.automation.apple-events` with broad targets.
  Library-validation disabled is precisely what makes a hardened app injectable.
- App Sandbox: if enabled, file access must go through security-scoped bookmarks; AI often writes
  raw path access that silently fails or forces the sandbox off.
- Ship a Developer ID signature with a secure timestamp; verify with `codesign --verify
  --deep --strict` and `spctl -a -vvv`; staple the ticket for offline installs.
- Sparkle/auto-update: signature verification (EdDSA) and HTTPS appcast are mandatory — an
  unverified updater is a remote code execution channel.

## Privileged helpers and XPC — the highest-risk area
- A `SMJobBless`/`SMAppService` privileged helper runs as **root**. Every XPC message is untrusted
  input from a potentially malicious local process.
- **Validate the peer**: audit token → code-signing requirement check (team ID + bundle ID +
  hardened runtime). Do not trust PID (PID-reuse race) and do not trust the process path.
- Validate every argument in the helper: no shell strings, no caller-supplied paths without
  canonicalisation and allowlisting, no caller-supplied binaries to execute.
- Helper API should be narrow and semantic ("quarantine this known-bad path"), never generic
  ("run this command as root").
- Same rules for `NSXPCConnection`: set `setCodeSigningRequirement:`, use strict interfaces and
  allowed classes for object decoding (`NSSecureCoding`).

## Filesystem and TCC
- TCC-protected paths (Desktop, Documents, Downloads, `~/Library/…`, `TCC.db`) fail without user
  consent or Full Disk Access — handle denial gracefully instead of crashing or looping.
- Symlink following, hardlink attacks, and race conditions when deleting/moving files as root.
  Use `O_NOFOLLOW`, file descriptors relative to a validated directory, and atomic renames.
- **Never delete without a reversible step** (trash/quarantine + restore metadata), never follow a
  symlink out of the intended directory, never operate on system volume paths (SIP).
- Respect `NSFileProtection`-equivalent expectations; don't traverse network volumes or
  `/System`; guard against enormous directory trees.
- Usage-description strings (`NSDesktopFolderUsageDescription` etc.) must be present and accurate.

## Distribution
- Universal binary (arm64 + x86_64) or a stated minimum; correct `LSMinimumSystemVersion`.
- DMG/pkg signed and notarized as well as the app.
- No `get-task-allow`, no debug logging, no dev endpoints in the release build.
- Crash reporting that doesn't ship user file paths/contents without consent.
