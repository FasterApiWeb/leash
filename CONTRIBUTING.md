# Contributing to Leash Secrets

Thank you for wanting to make the internet a little safer. Leash Secrets grows stronger with every contribution.

## How to Contribute

### 1. Add a Secret Pattern (Most Impactful)

Found a secret type that leash-secrets doesn't detect? Adding a pattern is the single most valuable contribution.

**Steps:**

1. Fork the repo
2. Find the right pattern file in `patterns/` (or create a new one)
3. Add your pattern following the schema in `patterns/schema.json`
4. Test it against real-world examples (redacted)
5. Submit a PR

**Pattern template:**

```json
{
  "id": "service-secret-type",
  "name": "Human-Readable Name",
  "severity": "critical",
  "regex": "your_regex_here",
  "description": "What this secret is",
  "risk": "What an attacker can do with it",
  "fix": "How to fix it (env var name, secret manager, etc.)",
  "rotation_url": "https://where-to-rotate.com",
  "false_positive_hints": ["When this pattern is NOT a real secret"]
}
```

**Requirements for patterns:**

- Regex must be tested against at least 3 real examples (redacted in the PR)
- Must include risk assessment and fix guidance
- Must not match common placeholder values (`test`, `example`, `your-key-here`)
- Should include `false_positive_hints` if the pattern has known false positives
- Use the `patterns/schema.json` for validation

### 2. Reduce False Positives

If leash-secrets is flagging something that isn't a secret:

1. Open an issue with the false positive example
2. Suggest an allowlist rule or regex refinement
3. Submit a PR with the fix

### 3. Add Agent Support

Want leash-secrets to work with a new AI agent?

1. Create the adapter file (rule file, plugin config, etc.)
2. Add install instructions to `scripts/install.sh`
3. Add documentation to the README
4. Submit a PR

### 4. Improve Documentation

- Better examples
- Translations
- Guides for specific stacks (Django, Rails, Next.js, etc.)

### 5. Fix Bugs

Check the [issues](https://github.com/FasterApiWeb/leash-secrets/issues) for bugs and feature requests.

## Development Setup

```bash
git clone https://github.com/FasterApiWeb/leash-secrets.git
cd leash-secrets
npm install

# Validate patterns
node scripts/check-patterns.js

# Run tests
npm test

# Package VS Code extension (dry run)
npm run package-extension
```

## Maintainer Release Setup

Releases are automated via [release-please](https://github.com/googleapis/release-please) when changes merge to `main`. Configure these GitHub Actions secrets once:

| Secret | Purpose | How to create |
|--------|---------|---------------|
| `NPM_TOKEN` | Publish `leash-secrets` to npm | [npmjs.com](https://www.npmjs.com) → Access Tokens → Granular token with **Read and Write** + **Bypass 2FA for publish** |
| `VSCE_PAT` | Publish `leash-secrets-vscode` to VS Marketplace | [Azure DevOps](https://dev.azure.com) → Personal Access Token with **Marketplace → Manage** scope |

Local publishing (if needed):

```bash
npm login          # npm account must have 2FA enabled
npm publish --access public

cd vscode-extension
export VSCE_PAT=your_token
npm run publish
```

## PR Guidelines

- **One pattern per PR** if adding patterns (makes review fast)
- **Include test cases** (redacted real-world examples)
- **Update the README** pattern count if adding new patterns
- **Keep commits atomic** — one logical change per commit
- **Use conventional commits**: `feat: add datadog pattern`, `fix: reduce aws false positives`

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Be kind, be helpful, be constructive.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
