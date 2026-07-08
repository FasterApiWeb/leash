# Adding Patterns

Step-by-step guide to contributing a new secret detection pattern.

## Before You Start

1. Check the [Pattern Reference](../patterns/reference.md) — the pattern might already exist
2. Check [open issues](https://github.com/FasterApiWeb/leash-secrets/issues?q=label%3Apattern) — someone might already be working on it
3. Gather at least 3 real examples of the secret format (redact them for the PR)

## Step 1: Identify the Pattern

Answer these questions:

- **What service/provider** does this secret belong to?
- **What prefix or format** does it have? (e.g., `sk_live_` + 24 alphanumeric)
- **What can an attacker do** with this secret?
- **Where can the user rotate** this secret?

## Step 2: Write the Regex

```regex
sk_live_[0-9a-zA-Z]{24,}
```

Guidelines:

- Include a fixed prefix when possible (reduces false positives dramatically)
- Specify exact character classes (`[0-9a-zA-Z]` not `.+`)
- Use `{min,max}` length bounds
- Use `(?i)` for case-insensitive matching when needed
- Test against your 3+ real examples

## Step 3: Choose the Right File

| If the secret is from... | Add to... |
|--------------------------|-----------|
| AWS, Amazon | `patterns/aws.json` |
| Google Cloud, Firebase | `patterns/gcp.json` |
| Microsoft Azure | `patterns/azure.json` |
| GitHub, GitLab, Bitbucket | `patterns/github.json` |
| OpenAI, Anthropic, AI services | `patterns/openai.json` |
| Stripe, PayPal, payments | `patterns/stripe.json` |
| PostgreSQL, MySQL, databases | `patterns/database.json` |
| Slack, Discord, messaging | `patterns/messaging.json` |
| npm, Docker, CI/CD | `patterns/ci-cd.json` |
| Private keys, certificates | `patterns/crypto.json` |
| Generic (passwords, tokens) | `patterns/generic.json` |
| **New provider** | Create `patterns/your-provider.json` and add to `patterns/index.json` |

## Step 4: Add the Pattern

```json
{
  "id": "service-secret-type",
  "name": "Service Name Secret Type",
  "severity": "critical",
  "regex": "prefix_[a-zA-Z0-9]{32}",
  "description": "What this secret is and where it comes from",
  "risk": "What an attacker can do with this secret",
  "fix": "Use ENV_VAR_NAME environment variable",
  "rotation_url": "https://service.com/settings/keys",
  "false_positive_hints": [
    "Test keys start with prefix_test_"
  ]
}
```

## Step 5: Add a Test Case

Add test cases to `tests/test-patterns.js`:

```javascript
'service-secret-type': {
  shouldMatch: [
    'prefix_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef',
  ],
  shouldNotMatch: [
    'prefix_short',
    'prefix_test_ABCDEFGHIJKLMNOPQRSTUVWXYZab',
  ],
},
```

## Step 6: Validate and Test

```bash
node scripts/check-patterns.js   # Validates schema
npm test                          # Runs all tests
```

## Step 7: Submit the PR

- Use commit message: `pattern: add <service> <type> detection`
- Include redacted real-world examples in the PR description
- Reference any related issue
