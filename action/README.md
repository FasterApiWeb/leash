# Leash GitHub Action

Scan your codebase for exposed API keys, tokens, and credentials in CI/CD.

## Quick Start

```yaml
name: Secret Scan
on: [push, pull_request]

jobs:
  leash:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: FasterApiWeb/leash/action@main
```

That's it. Leash will scan changed files and fail the check if critical secrets are found.

## Configuration

```yaml
- uses: FasterApiWeb/leash/action@main
  with:
    # What to scan: diff (changed files), all (full repo), staged
    scan-mode: diff

    # Minimum severity to report: critical, warning, info
    severity: warning

    # Fail the check at this level: critical, warning, none
    fail-on: critical

    # Path to scan (for scan-mode: all)
    path: '.'

    # Comma-separated patterns to exclude
    exclude: 'tests/**,docs/**,*.md'

    # Output format: text, json
    format: text
```

## Outputs

| Output | Description |
|--------|-------------|
| `findings` | Total number of findings |
| `critical` | Number of critical findings |
| `warning` | Number of warning findings |
| `report` | Path to the JSON report file |

### Using Outputs

```yaml
- uses: FasterApiWeb/leash/action@main
  id: leash

- name: Comment on PR
  if: steps.leash.outputs.critical != '0'
  run: |
    echo "Found ${{ steps.leash.outputs.critical }} critical secrets!"
```

## Examples

### Scan Only Changed Files (Default)

```yaml
- uses: FasterApiWeb/leash/action@main
  with:
    scan-mode: diff
    fail-on: critical
```

### Full Repo Audit

```yaml
- uses: FasterApiWeb/leash/action@main
  with:
    scan-mode: all
    fail-on: warning
```

### Block All Warnings (Lockdown Mode)

```yaml
- uses: FasterApiWeb/leash/action@main
  with:
    scan-mode: diff
    fail-on: warning
    severity: warning
```

### JSON Output for Custom Processing

```yaml
- uses: FasterApiWeb/leash/action@main
  id: leash
  with:
    format: json

- name: Process findings
  run: cat ${{ steps.leash.outputs.report }} | jq '.[] | select(.severity == "critical")'
```
