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

Releases use [release-please](https://github.com/googleapis/release-please). **Note:** the `FasterApiWeb` org blocks GitHub Actions from opening PRs, so release PRs must be created and merged manually.

### One-time secrets

| Secret | Purpose | How to create |
|--------|---------|---------------|
| `NPM_TOKEN` | Publish `leash-secrets` to npm | [npmjs.com](https://www.npmjs.com) → Access Tokens → Granular token with **Read and Write** + **Bypass 2FA for publish** |
| `VSCE_PAT` | Publish `leash-secrets-vscode` to VS Marketplace *(deferred)* | [Azure DevOps](https://dev.azure.com) → Personal Access Token with **Marketplace → Manage** scope |

### GitHub Actions policy (required for CI)

Repository/org Actions settings must allow GitHub-owned actions used by workflows (`actions/checkout`, `actions/setup-node`, `googleapis/release-please-action`, etc.). If CI shows `startup_failure` with zero jobs, set:

`Settings → Actions → General → Allow all actions and reusable workflows`

`local_only` blocks marketplace actions and prevents CI from starting.

### Release checklist

1. Push changes to `main` — CI must be green
2. Prepare the release branch locally (Actions cannot open PRs in this org):
   ```bash
   bash scripts/prepare-release.sh
   ```
3. Open the release PR (created by `prepare-release.sh`) and merge to `main`
4. **Wait for the Release workflow** to create the GitHub tag/release (do not create the tag manually first)
5. If auto-tag/npm does not run, finish manually:
   - GitHub Release tag `leash-secrets-vX.Y.Z` with tarball/zip assets
   - **Actions → Publish npm → Run workflow**

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

## Maintainer Governance

To keep the project secure and maintainable:

- `main` is protected: direct pushes are disabled for contributors
- Pull requests are required for all changes
- Required checks must pass before merge
- CODEOWNER review is required for security-sensitive paths
- Release tags and publish workflows are maintainer-controlled

If you are an external contributor, open a PR and include a clear test plan. Maintainers will guide you through any required adjustments.

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Be kind, be helpful, be constructive.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Writing allowlist rules

Allowlist patterns are **line-level** suppressions for educational/placeholder text.
They must never suppress the secret grammar itself.

**Good**
- `/not[_-]?a[_-]?real/i`
- `/REPLACE_ME/i`
- `/example\.com/i`

**Bad**
- `/-----BEGIN [A-Z0-9 ]+ PRIVATE KEY-----/` (matches real RSA/OpenSSH findings)
- Over-broad `\.+` / `...` tokens that appear in legitimate secrets

When adding an FP rule:
1. Add a **positive** fixture that still detects a real secret.
2. Add a **negative** fixture for the educational line you want suppressed.
3. Run the pattern test suite (`npm test` / project test script).

