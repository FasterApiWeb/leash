# Commands

All commands are available in agents that support skills/slash-commands (Cursor, Claude Code, Codex, Gemini CLI). For instruction-only agents, the always-on scanning works without commands.

## `/leash-secrets`

Set the scanning mode or show the current mode.

```
/leash-secrets              # Show current mode
/leash-secrets patrol       # Default — scan everything, block criticals
/leash-secrets sweep        # On-demand scanning only
/leash-secrets lockdown     # Block ALL findings including warnings
/leash-secrets off          # Disable scanning
```

## `/leash-secrets-scan`

Scan the current file or git diff for secrets.

```
/leash-secrets-scan                 # Scan current diff (staged + unstaged)
/leash-secrets-scan path/to/file    # Scan a specific file
/leash-secrets-scan --all           # Scan all tracked files
```

**Output:**

```
🔍 LEASH-SECRETS SCAN REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scanned: 12 files | 847 lines
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CRITICAL  2
🟡 WARNING   1
🟢 CLEAN     9

🔴 Stripe Live Secret Key — payments.py:3
   Matched: sk_liv....9iU
   Fix:     Use STRIPE_SECRET_KEY from environment

🔴 AWS Access Key ID — config.yml:18
   Matched: AKIAI....MPLE
   Fix:     Use AWS_ACCESS_KEY_ID from environment

🟡 Possible password — database.py:22
   Fix:     Confirm if this is a real credential

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## `/leash-secrets-audit`

Full repository security audit with an A–F score.

```
/leash-secrets-audit
```

**Output:**

```
📋 LEASH-SECRETS AUDIT REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Repository:  my-app
Files:       47 scanned
Findings:    0 critical | 2 warnings
Score:       B
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HYGIENE CHECKS
  ✅ .env is gitignored
  ✅ .env.example exists with placeholders
  ✅ No .env files in git history
  ✅ No private keys in repository
  ❌ CI/CD has hardcoded values in 1 file
  ✅ Docker configs use build args

RECOMMENDATIONS
  1. Move CI/CD secret in .github/workflows/deploy.yml:12
     to GitHub Actions secrets
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## `/leash-secrets-fix`

Auto-fix all detected secrets by replacing them with environment variable references.

```
/leash-secrets-fix              # Fix current file
/leash-secrets-fix --all        # Fix all files with findings
```

The fix is language-aware:

| Language | Fix Pattern |
|----------|------------|
| Python | `os.environ["VAR_NAME"]` |
| JavaScript/TypeScript | `process.env.VAR_NAME` |
| Go | `os.Getenv("VAR_NAME")` |
| Ruby | `ENV["VAR_NAME"]` |
| Java | `System.getenv("VAR_NAME")` |
| Rust | `std::env::var("VAR_NAME")` |
| Shell | `$VAR_NAME` |
| Docker | `ARG` or `--secret` mount |
| CI/CD YAML | `${{ secrets.VAR_NAME }}` |

## `/leash-secrets-report`

Generate a comprehensive, shareable security report saved to `leash-secrets-report-YYYY-MM-DD.md`.

```
/leash-secrets-report
```

Includes: executive summary, all findings, hygiene scorecard, recommendations, and a rotation checklist.

## `/leash-secrets-help`

Quick reference card for all commands.

```
/leash-secrets-help
```
