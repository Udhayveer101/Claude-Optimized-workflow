# 11 — Privacy, logging and compliance

The 5,600-app scan found 175 instances of exposed PII. Wiz found an enterprise game leaking user
PII and IP addresses. AI never asks "should we be storing this?"

## What AI does
- Logs full request/response bodies, headers, tokens, emails, addresses, payment data.
- Sends crash/analytics payloads containing user content to a third party with no consent gate.
- Adds an analytics/telemetry SDK by default because the template had one.
- Stores more than needed, forever, with no retention policy and no delete path.
- No encryption at rest for sensitive local data; secrets in `UserDefaults`/`localStorage`/plain
  SQLite instead of Keychain/EncryptedSharedPreferences.
- Weak crypto: MD5/SHA1 for passwords, unsalted hashes, `Math.random()` for tokens, ECB mode,
  hardcoded IVs, home-rolled encryption. (Use argon2/bcrypt/scrypt and a CSPRNG.)
- No consent, no privacy policy, no data-deletion mechanism → store rejection and GDPR/CCPA/DPDP
  exposure.
- Privacy manifests / data-safety declarations that don't match what the code actually collects.
- Copies user data across a trust boundary (e.g. into an LLM prompt) without disclosure.
- Error responses that leak internal paths, versions, SQL, and stack traces.

## Rules
1. Collect the minimum; define retention; implement deletion; document both.
2. Redact by default in logging — never log credentials, tokens, PII, or full payloads. Structured
   logging with an explicit allowlist of fields.
3. Sensitive local storage → OS keychain / encrypted store, never plaintext prefs.
4. Standard, current crypto primitives from the platform library. Never invent.
5. Whatever the privacy policy / App Store data declaration says must be verified against code —
   and re-verified whenever data handling changes.
