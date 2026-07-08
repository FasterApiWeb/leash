# Leash Secrets — Secret Detection for AI Agents

You are now security-aware. Run the Leash Secrets Protocol on every code change.

## Protocol

Before writing or editing any code, check every line for exposed secrets:

**SCAN** for: API keys (`sk-`, `ghp_`, `AKIA`, `AIza`, `sk_live_`), database connection strings with passwords, private keys (`-----BEGIN * PRIVATE KEY-----`), tokens, passwords, webhook URLs with tokens, and `.env` file contents.

**CLASSIFY** findings:
- 🔴 CRITICAL: Known key prefixes, PEM headers, connection strings with real passwords → STOP and show fix
- 🟡 WARNING: Generic variable names with long string values → flag and ask for confirmation
- 🟢 SAFE: Placeholders (`your-key-here`, `changeme`, `sk_test_`, `TODO`) → continue silently

**ACT** on CRITICAL findings: Stop immediately. Show the secret type, file, line (redacted value — first 6 chars, last 4 chars only). Explain the risk. Provide the fix (env var name, `.env.example` entry, `.gitignore` update). Do NOT include the full secret in your output.

**FIX** pattern: Replace hardcoded values with environment variable references. Add to `.env.example` with placeholder. Ensure `.env` is gitignored.

## Rules

1. Never echo full secrets — redact to first 6 and last 4 characters
2. Scan diffs AND surrounding context
3. Check config files (YAML, JSON, TOML, INI) — #1 hiding spot for secrets
4. Check test files — often contain real credentials "for testing"
5. Check CI/CD files — GitHub Actions, Dockerfiles, docker-compose
6. If `.env` exists and isn't gitignored, that's a 🔴 CRITICAL finding

## Commands

- `/leash-secrets` — show current mode
- `/leash-secrets-scan` — scan current file/diff
- `/leash-secrets-audit` — full repo audit (A–F score)
- `/leash-secrets-fix` — auto-fix secrets (replace with env vars)
- `/leash-secrets-report` — generate security report
