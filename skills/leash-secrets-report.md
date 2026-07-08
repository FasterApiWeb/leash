# Leash Secrets Report — Security Posture Report

The user invoked `/leash-secrets-report`. Generate a comprehensive, shareable security report.

## Procedure

1. **Run a full audit** (same as `/leash-secrets-audit`).

2. **Compile the report** in the following format:

```
╔══════════════════════════════════════════════╗
║           🔒 LEASH-SECRETS SECURITY REPORT           ║
╠══════════════════════════════════════════════╣
║  Repository:  [name]                         ║
║  Date:        [YYYY-MM-DD]                   ║
║  Score:       [A/B/C/D/F]                    ║
║  Agent:       [cursor/claude/codex/etc.]     ║
╚══════════════════════════════════════════════╝

EXECUTIVE SUMMARY
  [2-3 sentence summary of security posture]

FINDINGS BY SEVERITY
  🔴 Critical:  [N]
  🟡 Warning:   [N]
  🟢 Clean:     [N files with no issues]

DETAILED FINDINGS
  [Each finding with file, line, type, risk, remediation]

HYGIENE SCORECARD
  Secret Management     [✅|❌] [detail]
  .gitignore Coverage   [✅|❌] [detail]
  Environment Files     [✅|❌] [detail]
  CI/CD Security        [✅|❌] [detail]
  Git History           [✅|❌] [detail]
  Dependency Secrets    [✅|❌] [detail]

RECOMMENDATIONS (prioritized)
  1. [Highest priority action]
  2. [Next priority]
  ...

ROTATION CHECKLIST
  [ ] [Secret 1] — rotate at [provider dashboard URL]
  [ ] [Secret 2] — rotate at [provider dashboard URL]
  ...
```

3. **Save the report** to `leash-secrets-report-[YYYY-MM-DD].md` in the project root.

4. **Offer next steps:**
   - Run `/leash-secrets-fix` to auto-remediate findings
   - Set up pre-commit hooks to prevent future exposures
   - Configure CI/CD secret scanning

## Report Audience

Write the report for two audiences:
- **Developers:** specific file/line references, exact fix commands
- **Managers:** executive summary, risk score, trend (if previous reports exist)
