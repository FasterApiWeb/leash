# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in leash-secrets, please report it responsibly.

**DO NOT open a public issue for security vulnerabilities.**

Email: **security@leash-secrets.dev** (or open a private security advisory on GitHub)

We will:
1. Acknowledge receipt within 48 hours
2. Investigate and provide a timeline within 1 week
3. Release a fix and credit you (unless you prefer anonymity)

## Scope

Leash Secrets is a prompt-based skill and a pattern library. Its attack surface is minimal:

| Component | Risk | Mitigation |
|-----------|------|------------|
| Skill files (`.md`) | Prompt injection via malicious skill content | Only install from trusted sources (this repo) |
| Pattern files (`.json`) | Malicious regex (ReDoS) | Patterns are reviewed; use timeout in custom implementations |
| Install script (`install.sh`) | Supply chain attack | Pin to specific commits; verify checksums |
| Pre-commit hook | Bypass via `--no-verify` | Defense in depth; use CI scanning too |

## Privacy & Telemetry

Leash Secrets makes **zero network calls** after installation:

- No telemetry
- No analytics
- No crash reporting
- No update checks
- No phone-home behavior of any kind

**Install-time network calls:**
- `curl` to `raw.githubusercontent.com` to download skill/rule files
- `gemini extensions install` calls GitHub (if Gemini CLI is being configured)

These are the only network calls leash-secrets ever makes, and they only happen during installation.

## Secret Handling

Leash Secrets' own skill files and patterns **never contain real secrets**. All examples use clearly fake values.

When leash-secrets detects a secret in your code:
- The full secret is **never logged, stored, or transmitted**
- Output shows only the first 6 and last 4 characters
- The pre-commit hook processes files in memory and discards findings after display

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅ Current |

## Supply Chain Security

- All releases are tagged and signed
- The install script fetches from `raw.githubusercontent.com` (GitHub's CDN)
- For maximum security, clone the repo and copy files manually instead of using the install script
