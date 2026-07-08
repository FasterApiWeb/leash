# Security

## Reporting Vulnerabilities

**Do NOT open a public issue for security vulnerabilities.**

Email: **security@leash-secrets.dev** (or use [GitHub's private security advisory](https://github.com/FasterApiWeb/leash-secrets/security/advisories/new))

We will:

1. Acknowledge within 48 hours
2. Investigate and provide a timeline within 1 week
3. Release a fix and credit you (unless you prefer anonymity)

## Attack Surface

Leash Secrets is a prompt and a pattern library. Its attack surface is minimal:

| Component | Risk | Mitigation |
|-----------|------|------------|
| Skill files (`.md`) | Prompt injection | Only install from this repo |
| Pattern files (`.json`) | ReDoS via malicious regex | Patterns are reviewed; use timeout |
| Install script | Supply chain attack | Pin to commits; verify checksums |
| Pre-commit hook | Bypass via `--no-verify` | Defense in depth; use CI scanning too |

## Privacy & Telemetry

Leash Secrets makes **zero network calls** after installation.

- No telemetry
- No analytics
- No crash reporting
- No update checks
- No phone-home behavior

Install-time network calls are limited to `curl` from `raw.githubusercontent.com`.

## Secret Handling

- Full secrets are **never logged, stored, or transmitted**
- Output shows only first 6 and last 4 characters
- Pre-commit hook processes files in memory and discards findings after display
- All examples in the repo use clearly fake values
