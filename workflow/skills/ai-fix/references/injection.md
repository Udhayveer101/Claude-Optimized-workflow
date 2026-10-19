# 05 — Input validation and injection

Veracode: models fail to defend against XSS in **86%** of relevant samples. Injection appears
whenever the model follows an input-shaped pattern without applying sanitisation.

## Classes AI reliably introduces
- **SQL injection** — string-interpolated queries; f-strings/template literals into SQL; ORM
  `raw()` escapes; dynamic `ORDER BY`/table names built from user input.
- **Command injection** — `exec`/`system`/`shell=True`/`Process` with an interpolated argument;
  passing a user-controlled path into a shell one-liner.
- **XSS** — `innerHTML`, `dangerouslySetInnerHTML`, unescaped template output, `eval`,
  `WKWebView`/`WebView` loading user HTML, markdown rendered without sanitising.
- **Path traversal** — user-supplied filename joined to a base dir without normalising and
  re-checking containment (`../../`), archive extraction (zip-slip), symlink following.
- **SSRF** — server fetches a user-supplied URL; no allowlist, no block on internal ranges /
  link-local metadata (169.254.169.254), no redirect re-validation.
- **Deserialisation** — `pickle`, `yaml.load`, `NSKeyedUnarchiver` without secure coding,
  `JSON.parse` into a trusted-shape object without schema validation.
- **XXE / entity expansion** in XML parsing; zip bombs; regex catastrophic backtracking (ReDoS)
  from AI-written regexes with nested quantifiers.
- **Prototype pollution** in JS deep-merge helpers AI loves to write inline.
- **Open redirect** from a `?next=` parameter used unvalidated.
- **Template injection** in server-side templating.
- **Log injection / CRLF** from unescaped user input in log lines and headers.
- **Mass assignment** — passing the whole request body into an ORM create/update, letting a user
  set `role`, `is_admin`, `balance`.

## Rules
1. Validate at the **trust boundary**, with a schema (zod/pydantic/Codable + explicit checks),
   allowlist not denylist, correct types, length caps, ranges.
2. Parameterised queries always. No exceptions for "internal" values.
3. Escape at the point of output, per context (HTML / attribute / JS / URL / SQL / shell).
4. Never build a shell string; pass an argument array and avoid the shell entirely.
5. Canonicalise paths and assert the result is inside the intended directory.
6. Upload handling: cap size, verify content type by sniffing not by extension, store outside
   web root, never execute, randomise filenames.
7. Size limits on every body, array, and loop driven by external input.
