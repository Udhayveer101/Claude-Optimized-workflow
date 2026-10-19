# 15 — Distribution readiness

Everything between "it works on my machine" and "a stranger can install and trust it".

## Build
- Release configuration actually used; debug flags, verbose logging, dev/staging endpoints,
  feature-flag overrides, and test fixtures removed.
- Optimisation/stripping enabled; no debug entitlements (`get-task-allow`); symbols archived
  separately for crash symbolication.
- Deterministic, reproducible build from a clean checkout — no untracked local files required.
- Version and build number bumped, consistent across all manifests.
- All target architectures / minimum OS versions correct and tested on the minimum.

## Signing and trust
- Signed with the right identity, timestamped, notarized/stapled (macOS) or correctly signed and
  uploaded (mobile). Verified on a *clean machine*, not the dev machine.
- Auto-update channel signature-verified over HTTPS.

## Legal / policy
- Licence file; third-party licence attributions; no incompatible copied code.
- Privacy policy published, accurate, and matching the privacy manifest / data-safety form.
- Account deletion path if accounts exist; export path if the platform requires it.
- Export-compliance / encryption declarations answered correctly.
- Trademark/asset rights for icons, fonts, and images actually cleared.

## User-facing quality
- First-run experience on a machine with none of your state: no crash, no blank screen, clear
  permission prompts with real rationale, and a working path when permission is denied.
- Uninstall/cleanup leaves no root-owned helper or launch item behind, and removal is documented.
- Errors are human-readable and actionable; no raw stack traces.
- Empty, loading, offline, and failure states exist for every screen.
- Accessibility basics pass; text scales; contrast adequate; keyboard/VoiceOver usable.
- Localised strings complete in every shipped language.
- Support contact, changelog, and a way to report a bug.

## Operational
- Crash/error reporting wired (with consent), with a triage path.
- Rollback plan; a kill-switch or version gate for a bad release.
- Backups and restore tested if there's a server.
- Smoke test on a clean install of the release artifact — the exact bytes users get.
