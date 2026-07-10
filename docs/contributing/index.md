# Contributing

Thank you for making the internet safer. Leash Secrets grows stronger with every contribution.

## Ways to Contribute

### 1. Add a Secret Pattern (Highest Impact)

Found a secret type leash-secrets doesn't detect? This is the most valuable contribution.

[Adding Patterns Guide :material-arrow-right:](adding-patterns.md)

### 2. Reduce False Positives

If leash-secrets flags something that isn't a secret, help us fix it:

1. [Open a false positive report](https://github.com/FasterApiWeb/leash-secrets/issues/new?template=false-positive.yml)
2. Suggest a regex refinement or allowlist rule
3. Submit a PR

### 3. Add Agent Support

Want leash-secrets to work with a new AI agent?

1. Create the adapter file (rule file, plugin config, etc.)
2. Add install instructions to `scripts/install.sh`
3. Update the [agent portability docs](../guide/agent-portability.md)
4. Submit a PR

### 4. Improve Documentation

- Better examples
- Translations
- Stack-specific guides (Django, Rails, Next.js, etc.)

### 5. Fix Bugs

Check [open issues](https://github.com/FasterApiWeb/leash-secrets/issues) for bugs and feature requests.

## PR Guidelines

- **One pattern per PR** for pattern additions (fast review)
- **Include test cases** (redacted real-world examples)
- **Use conventional commits**: `feat:`, `fix:`, `docs:`, `pattern:`
- **Run validation** before submitting

```bash
node scripts/check-patterns.js
npm test
```

## Maintainers: CI/CD & releases

Workflow table, secrets, mental model, and ship steps:

[CI/CD & Releases :material-arrow-right:](ci-cd.md)

## Code of Conduct

See [Code of Conduct](https://github.com/FasterApiWeb/leash-secrets/blob/main/CODE_OF_CONDUCT.md). Be kind, be helpful, be constructive.
