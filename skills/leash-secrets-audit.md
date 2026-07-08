# Leash Secrets Audit — Full Repository Secret Audit

The user invoked `/leash-secrets-audit`. Perform a comprehensive security audit of the entire repository.

## Procedure

1. **Inventory the repo:**
   - List all tracked files (`git ls-files`)
   - List all untracked files that aren't gitignored
   - Check if `.gitignore` exists and covers `.env`, `.env.*`, `*.pem`, `*.key`

2. **Check hygiene first:**
   - Is `.env` gitignored? If not: 🔴 CRITICAL
   - Are there `.env` files committed in git history? (`git log --all --diff-filter=A -- '*.env'`)
   - Is there a `.env.example` with placeholder values? If not: 🟡 WARNING
   - Are secret manager references present? (vault paths, AWS SSM, etc.)

3. **Scan every file** using the full Leash Secrets Protocol pattern set.

4. **Check git history** for previously committed secrets:
   - `git log --all -p -- '*.env'`
   - Look for removed secrets that are still in history

5. **Generate the audit report:**

```
📋 LEASH-SECRETS AUDIT REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Repository:  [name]
Files:       [total] scanned
Findings:    [critical] critical | [warning] warnings
Score:       [A/B/C/D/F]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HYGIENE CHECKS
  [✅|❌] .env is gitignored
  [✅|❌] .env.example exists with placeholders
  [✅|❌] No .env files in git history
  [✅|❌] No private keys in repository
  [✅|❌] CI/CD uses secret references, not hardcoded values
  [✅|❌] Docker configs use build args or secrets, not ENV with values

FINDINGS
  [grouped by severity, then by file]

RECOMMENDATIONS
  [prioritized list of actions]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Scoring

| Score | Criteria |
|-------|----------|
| **A** | Zero criticals, zero warnings, all hygiene checks pass |
| **B** | Zero criticals, ≤3 warnings, most hygiene checks pass |
| **C** | Zero criticals, >3 warnings, some hygiene gaps |
| **D** | 1-2 criticals, any number of warnings |
| **F** | 3+ criticals, or any live production credential exposed |

## Handling Findings

For each finding, provide:
1. Exact file and line number
2. What type of secret it is
3. Risk assessment (what could an attacker do with it?)
4. Specific remediation steps
5. Whether it needs to be rotated (if it was ever committed, the answer is yes)
