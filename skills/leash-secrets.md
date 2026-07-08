# Leash Secrets — Secret Detection Skill

You are now security-aware. Every time you write, edit, review, or commit code, you run the Leash Secrets Protocol. No exceptions.

## The Leash Secrets Protocol

Before outputting any code, run this ladder top-down. Stop at the first match.

### 1. SCAN

Check every line you write or touch for:

| Category | Examples |
|----------|----------|
| Cloud credentials | `AWS_SECRET_ACCESS_KEY`, `AZURE_CLIENT_SECRET`, `GOOGLE_APPLICATION_CREDENTIALS`, GCP service account JSON |
| API keys | OpenAI (`sk-...`), Anthropic (`sk-ant-...`), Stripe (`sk_live_...`, `rk_live_...`), Twilio, SendGrid, Datadog |
| Tokens | GitHub (`ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`), GitLab (`glpat-`), npm (`npm_`), PyPI, Slack (`xoxb-`, `xoxp-`, `xoxs-`), Discord bot tokens |
| Database strings | `postgres://user:password@`, `mongodb+srv://user:password@`, `mysql://`, Redis URLs with passwords |
| Private keys | `-----BEGIN (RSA|EC|DSA|OPENSSH) PRIVATE KEY-----`, PGP private blocks |
| JWT secrets | Long base64 strings used as `JWT_SECRET`, `SECRET_KEY`, `SIGNING_KEY` |
| Webhook URLs | Slack webhooks (`hooks.slack.com/services/T.../B.../...`), Discord webhooks, Stripe webhook secrets |
| Passwords | `password = "..."`, `passwd`, `DB_PASSWORD`, hardcoded auth credentials |
| Certificates | PEM-encoded private certs, PKCS12 references with passwords |
| Internal URLs | Internal IPs, staging/prod URLs with embedded credentials |

### 2. CLASSIFY

| Severity | Meaning | Pattern |
|----------|---------|---------|
| 🔴 **CRITICAL** | Live secret, real credential, immediate exposure risk | Matches known key prefixes (`sk-`, `ghp_`, `AKIA`, `sk_live_`), PEM headers, connection strings with non-placeholder passwords |
| 🟡 **WARNING** | Might be real, might be example — needs human confirmation | Generic variable names (`API_KEY`, `SECRET`), base64 strings, tokens without known prefixes |
| 🟢 **SAFE** | Clearly placeholder or test value | `your-api-key-here`, `example.com`, `test_`, `sk_test_`, `TODO`, `xxx`, `changeme`, `password123` |

### 3. ACT

**On 🔴 CRITICAL:**

```
⛔ LEASH-SECRETS — SECRET DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━
Type:     [secret type]
File:     [filename:line]
Value:    [first 6 chars]....[last 4 chars]
Risk:     [what happens if exposed]
━━━━━━━━━━━━━━━━━━━━━━━━━
FIX: [specific fix — env var name, .env entry, vault path]
```

STOP writing. Show the block above. Do NOT include the secret in your output. Provide the fix. Wait for user acknowledgment before continuing.

**On 🟡 WARNING:**

```
⚠️  LEASH-SECRETS — POSSIBLE SECRET
Type:     [secret type]
File:     [filename:line]
Action:   Is this a real credential or a placeholder?
```

Flag it inline. Continue, but ask the user to confirm.

**On 🟢 SAFE:** Continue silently.

### 4. FIX

When you catch a secret, always provide the complete fix:

1. **Replace** the hardcoded value with an environment variable reference
2. **Add** the variable to `.env.example` with a placeholder value
3. **Ensure** `.env` is in `.gitignore`
4. **Suggest** the appropriate secret manager for the stack (AWS Secrets Manager, HashiCorp Vault, Doppler, 1Password CLI, etc.)

Fix template:
```
# Instead of:
api_key = "sk-abc123realkey456"

# Use:
api_key = os.environ["OPENAI_API_KEY"]

# .env.example:
OPENAI_API_KEY=your-openai-api-key-here

# .gitignore (add if missing):
.env
.env.local
.env.*.local
```

## Always-On Rules

1. **Never echo secrets.** If you find a secret in existing code, show only the first 6 and last 4 characters with dots in between. Never print the full value.
2. **Scan diffs, not just new code.** When editing existing files, scan the surrounding context too — secrets hide near the code you're changing.
3. **Check config files.** YAML, JSON, TOML, INI, XML config files are the #1 hiding spot.
4. **Check test files.** Test fixtures often contain real credentials copied for "quick testing."
5. **Check CI/CD files.** GitHub Actions, GitLab CI, Dockerfiles, and docker-compose files frequently contain hardcoded secrets.
6. **Check documentation.** README files and docs sometimes contain real API keys in "example" curl commands.
7. **Remember .env files.** If a user shares `.env` contents, warn them never to commit it.
8. **Git history matters.** If a secret was in the code and got removed, it's still in git history. Flag it and suggest `git filter-branch` or BFG Repo-Cleaner.

## What Is NOT a Secret

Do not flag these:
- Public keys (only private keys are secrets)
- Package names or registry URLs without credentials
- Hash digests (SHA256, MD5 of public content)
- UUIDs used as identifiers (not auth tokens)
- Version strings, build numbers
- Base64-encoded public data (logos, icons)
- Test API keys clearly marked as test (`sk_test_`, `pk_test_`)
- Example values: `your-key-here`, `REPLACE_ME`, `changeme`, `xxx`, `TODO`

## Modes

| Mode | Behavior |
|------|----------|
| `patrol` *(default)* | Scan everything you write and touch. Block criticals, warn on warnings. |
| `sweep` | On-demand full-file or full-repo scan. Use with `/leash-secrets-scan`. |
| `lockdown` | Block ALL warnings too, not just criticals. For pre-release audits. |
| `off` | Disable leash-secrets. Secrets are your problem now. |

Switch with `/leash-secrets [patrol|sweep|lockdown|off]`.

## Commands

| Command | What it does |
|---------|-------------|
| `/leash-secrets [mode]` | Set mode or show current mode |
| `/leash-secrets-scan` | Scan current file or diff for secrets |
| `/leash-secrets-audit` | Full repo audit — every file, every pattern |
| `/leash-secrets-fix` | Auto-fix all detected secrets in current file (replace with env vars) |
| `/leash-secrets-report` | Generate a security report with findings, severity, and remediation steps |
| `/leash-secrets-help` | Quick reference card |
