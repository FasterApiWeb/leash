# Custom Patterns

Leash Secrets' detection engine is powered by extensible JSON pattern files. Add patterns for your organization's internal services, custom tokens, or any secret format leash-secrets doesn't cover.

## Quick Start

### 1. Create a Pattern File

```json title="patterns/my-company.json"
{
  "provider": "my-company",
  "display_name": "My Company Internal Services",
  "patterns": [
    {
      "id": "myco-api-key",
      "name": "MyCompany API Key",
      "severity": "critical",
      "regex": "myco_[a-zA-Z0-9]{32}",
      "description": "Internal API key for MyCompany services",
      "risk": "Access to internal APIs and data",
      "fix": "Use MYCO_API_KEY environment variable",
      "rotation_url": "https://internal.mycompany.com/settings/keys",
      "false_positive_hints": [
        "Test keys start with myco_test_"
      ]
    }
  ]
}
```

### 2. Register It

Add the filename to `patterns/index.json`:

```json
{
  "pattern_files": [
    "aws.json",
    "...",
    "my-company.json"  // [!code ++]
  ]
}
```

### 3. Validate

```bash
node scripts/check-patterns.js
```

## Schema Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier, kebab-case (`myco-api-key`) |
| `name` | `string` | Human-readable name |
| `severity` | `string` | `critical`, `warning`, or `info` |
| `regex` | `string` | Regular expression to detect the secret |
| `description` | `string` | What this secret is |
| `risk` | `string` | What an attacker can do with it |
| `fix` | `string` | How to remediate |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `rotation_url` | `string` | URL to rotate/revoke the secret |
| `false_positive_hints` | `string[]` | When this pattern is NOT a real secret |

## Severity Guidelines

| Level | When to Use | Agent Behavior |
|-------|-------------|----------------|
| `critical` | The match is almost certainly a real, usable secret | **Block** — stop and show fix |
| `warning` | Might be real, might be a test/example value | **Flag** — ask for confirmation |
| `info` | Informational (e.g., internal IPs, staging URLs) | **Note** — mention but don't block |

## Regex Best Practices

!!! tip "Be specific"
    `[a-zA-Z0-9]{32}` alone will match too many things. Always include a prefix: `myco_[a-zA-Z0-9]{32}`.

!!! tip "Case sensitivity"
    Use `(?i)` at the start for case-insensitive matching when variable names vary.

!!! warning "Avoid ReDoS"
    Never use nested quantifiers like `(a+)+`. Test your regex for catastrophic backtracking.

!!! tip "Context matters"
    For generic patterns (like password assignments), include the variable name in the regex to reduce false positives.

## Contributing Upstream

Found a secret type that leash-secrets should detect for everyone?

1. Fork the repo
2. Add the pattern to the appropriate file in `patterns/`
3. Run `node scripts/check-patterns.js` and `npm test`
4. Submit a PR with redacted real-world test cases

See [Adding Patterns](../contributing/adding-patterns.md) for the full guide.
