# Leash Secrets Scan — On-Demand Secret Scanner

The user invoked `/leash-secrets-scan`. Perform a targeted secret scan.

## Procedure

1. **Determine scope:**
   - If a file path is given, scan that file
   - If no path is given, scan the current git diff (`git diff --cached` for staged, `git diff` for unstaged)
   - If `--all` flag is given, scan all tracked files

2. **For each file in scope:**
   - Read the file contents
   - Run every pattern from the Leash Secrets Protocol (see `skills/leash-secrets.md`)
   - Record each finding with: file path, line number, secret type, severity, matched snippet (redacted)

3. **Output the report:**

```
🔍 LEASH-SECRETS SCAN REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scanned: [N] files | [M] lines
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CRITICAL  [count]
🟡 WARNING   [count]
🟢 CLEAN     [count]

[For each finding:]
[severity emoji] [type] — [file]:[line]
   Matched: [first 6 chars]....[last 4 chars]
   Fix:     Use [ENV_VAR_NAME] from environment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

4. **If zero findings:** Report the all-clear.

```
✅ LEASH-SECRETS SCAN — ALL CLEAR
Scanned [N] files. No secrets detected.
```

## File Priority Order

Scan these file types first (highest secret density):
1. `.env`, `.env.*` (should never be committed)
2. Config files: `*.yml`, `*.yaml`, `*.json`, `*.toml`, `*.ini`, `*.xml`, `*.conf`
3. CI/CD: `.github/workflows/*`, `.gitlab-ci.yml`, `Jenkinsfile`, `Dockerfile`, `docker-compose*`
4. Source code: `*.py`, `*.js`, `*.ts`, `*.rb`, `*.go`, `*.java`, `*.rs`, `*.php`
5. Documentation: `*.md`, `*.rst`, `*.txt`
6. Shell scripts: `*.sh`, `*.bash`, `*.zsh`
7. Notebooks: `*.ipynb`

## Redaction Rule

NEVER output a full secret value. Always redact:
- Show at most the first 6 characters and last 4 characters
- Replace the middle with `....`
- Example: `sk-abc1....xyz9`
