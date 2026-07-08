# Custom Patterns

Leash Secrets' detection engine is powered by extensible JSON pattern files. You can add patterns for your organization's internal services, custom tokens, or any secret format leash-secrets doesn't cover yet.

## Pattern File Structure

Each pattern file represents a provider or category:

```json
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

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier, kebab-case (e.g., `myco-api-key`) |
| `name` | string | Human-readable name |
| `severity` | string | `critical`, `warning`, or `info` |
| `regex` | string | Regular expression to detect the secret |
| `description` | string | What this secret is and where it comes from |
| `risk` | string | What an attacker can do with this secret |
| `fix` | string | How to remediate (env var name, secret manager, etc.) |

## Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `rotation_url` | string | URL where the user can rotate/revoke this secret |
| `false_positive_hints` | string[] | When this pattern matches something that isn't a secret |

## Severity Guidelines

- **critical**: The matched value is almost certainly a real, usable secret. The agent should STOP and block.
- **warning**: The matched value might be a secret but could also be a test/example value. The agent should flag and ask.
- **info**: Informational finding (e.g., internal IP addresses). The agent should note but not block.

## Regex Best Practices

1. **Be specific.** `[a-zA-Z0-9]{32}` alone will match many things. Add a prefix: `myco_[a-zA-Z0-9]{32}`.
2. **Use anchors carefully.** Most patterns should match anywhere in a line, not just at the start.
3. **Test for ReDoS.** Avoid nested quantifiers like `(a+)+` that can cause catastrophic backtracking.
4. **Consider context.** Use `(?i)` for case-insensitive matching when variable names vary in casing.
5. **Avoid over-matching.** Your pattern should not match common placeholder values.

## Adding Your Pattern

1. Create a new file in `patterns/` (e.g., `patterns/my-company.json`)
2. Follow the schema in `patterns/schema.json`
3. Add the filename to `patterns/index.json`'s `pattern_files` array
4. Validate: `node scripts/check-patterns.js`
5. Test: `node tests/test-patterns.js`
6. Submit a PR

## Validating Patterns

```bash
node scripts/check-patterns.js
```

This checks:
- All files referenced in `index.json` exist
- All patterns have required fields
- All regexes are valid
- No duplicate pattern IDs
- Severity values are valid
