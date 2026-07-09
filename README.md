<img src="docs/assets/leash-secrets-logo.png" align="right" width="140" alt="leash-secrets" />

# leash-secrets

**Defense layer 0 for AI-generated code** — catches API keys, tokens, and credentials while your agent writes, not after `git push`.

Maintained by [**EshwarCVS**](https://github.com/EshwarCVS) · [**FasterApiWeb**](https://github.com/FasterApiWeb)

[![npm](https://img.shields.io/npm/v/leash-secrets.svg)](https://www.npmjs.com/package/leash-secrets)
[![CI](https://github.com/FasterApiWeb/leash-secrets/actions/workflows/ci.yml/badge.svg)](https://github.com/FasterApiWeb/leash-secrets/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![docs](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://fasterapiweb.github.io/leash-secrets/)

**[Setup](#setup)** · **[Detection examples](#detection-examples)** · **[Benchmark corpus](benchmarks/)** · **[Docs](https://fasterapiweb.github.io/leash-secrets)** · **[Contributing](CONTRIBUTING.md)**

![leash-secrets CLI demo](docs/assets/demo.gif)

---

## The problem

AI agents generate real credentials into source files — Stripe live keys, AWS pairs, database URLs, JWT signing secrets. [GitHub secret scanning](https://github.blog/security/secret-scanning/) catches millions of leaks **after** push. gitleaks and truffleHog catch them **after** commit.

**leash-secrets runs inside the agent** (Cursor, Claude Code, Codex, Copilot, Gemini, Windsurf, Cline, and any tool that reads `AGENTS.md`). It scans what the model writes and blocks critical findings before the file exists.

Use it **with** traditional scanners, not instead of them.

## Detection examples

### Without leash-secrets

Your agent sets up Stripe:

```python
import stripe
stripe.api_key = "sk_live_" + "YourActualKeyWouldBeHere1234567890"
```

Production key. In source. One push from public.

### With leash-secrets

```
⛔ LEASH-SECRETS — SECRET DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:     Stripe Live Secret Key
File:     payments.py:3
Value:    sk_liv....9iU
Risk:     CRITICAL — Can create charges, refunds, and transfer
          real money. Access to all customer payment data.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX:
  1. Use environment variable:
     stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
  2. Add to .env.example:
     STRIPE_SECRET_KEY=your-stripe-secret-key-here
  3. Ensure .env is in .gitignore
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

The agent stops. Shows the risk. Provides the fix. The key never lands in the repo.

<details>
<summary><strong>More examples — AWS, OpenAI, database, SSH key</strong></summary>

### AWS Credentials

```
⛔ LEASH-SECRETS — SECRET DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:     AWS Access Key ID
File:     config.py:12
Value:    AKIAI....3Q7A
Risk:     Full access to AWS account. Attacker can spin up
          instances, access S3 buckets, read databases,
          and run up your bill.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX:      Use AWS_ACCESS_KEY_ID env var or IAM roles
ROTATE:   https://console.aws.amazon.com/iam/home#/security_credentials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Database Connection String

```
⛔ LEASH-SECRETS — SECRET DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:     PostgreSQL Connection String with Password
File:     database.ts:5
Value:    postgr....m/db
Risk:     Direct access to the database. Attacker can read,
          modify, or delete ALL data.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX:      Use DATABASE_URL environment variable
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### OpenAI API Key in .env Committed to Git

```
⛔ LEASH-SECRETS — SECRET DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:     OpenAI Project API Key
File:     .env:3
Value:    sk-pro....Q7xR
Risk:     Access to OpenAI API. Attacker can run models
          and incur significant charges on your account.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX:      .env should NEVER be committed.
          1. Add .env to .gitignore
          2. Remove from git: git rm --cached .env
          3. Rotate the key: https://platform.openai.com/api-keys
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### SSH Private Key

```
⛔ LEASH-SECRETS — SECRET DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:     OpenSSH Private Key
File:     deploy/id_rsa:1
Value:    -----BEGIN OPENSSH PRIVATE KEY-----
Risk:     Grants SSH access to any server that has the
          corresponding public key in authorized_keys.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX:      Never commit SSH keys.
          1. Remove the file from the repo
          2. Add *.pem, id_rsa, id_ed25519 to .gitignore
          3. Use SSH agent forwarding or deploy keys
          4. If committed, the key is compromised — generate a new one
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

</details>

## The Problem

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   2024:  1M+ secrets leaked on GitHub (GitHub Security Report) │
│   2025:  AI-generated code accelerates the problem             │
│   2026:  You are here                                          │
│                                                                │
│   ┌─ Traditional tools ──────────────────────────────────────┐ │
│   │  truffleHog, gitleaks, git-secrets                       │ │
│   │  → Scan AFTER commit (damage done)                       │ │
│   │  → Pre-commit hooks (can be skipped)                     │ │
│   │  → No AI awareness (don't know what the agent is doing)  │ │
│   └──────────────────────────────────────────────────────────┘ │
│                                                                │
│   ┌─ leash-secrets ─────────────────────────────────────────┐ │
│   │  → Catches secrets AT THE POINT OF CREATION              │ │
│   │  → Integrated into the AI agent's decision loop          │ │
│   │  → Agent understands context (test vs production)        │ │
│   │  → Provides specific, actionable fixes                   │ │
│   │  → Pre-commit hook as backup safety net                  │ │
│   └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

Leash Secrets doesn't replace your existing security tools. It adds a layer that catches secrets **before they exist in any file**, because the AI agent that's writing the code is also the one checking it.

## Setup

### Universal installer

```bash
# macOS · Linux · WSL
curl -fsSL https://raw.githubusercontent.com/FasterApiWeb/leash-secrets/main/scripts/install.sh | bash
```

```powershell
# Windows PowerShell
irm https://raw.githubusercontent.com/FasterApiWeb/leash-secrets/main/scripts/install.ps1 | iex
```

Detects installed agents and copies the right skill/rule files. Idempotent — safe to re-run.

### CLI only

```bash
npm install -g leash-secrets
leash-secrets scan .
```

Patrol mode is on by default in the agent skill — critical secrets are blocked without running a command. Use `/leash-secrets off` to disable.

<details>
<summary><strong>Per-agent install paths</strong></summary>

### Cursor

Copy the rule file to your project or global rules:

```bash
# Project-level (recommended)
cp .cursor/rules/leash-secrets.mdc your-project/.cursor/rules/

# Global
cp .cursor/rules/leash-secrets.mdc ~/.cursor/rules/
```

### Claude Code

```bash
# Via skill
cp skills/leash-secrets.md ~/.claude/skills/

# Or add to CLAUDE.md
cat AGENTS.md >> your-project/CLAUDE.md
```

### GitHub Copilot

```bash
# Project-level
cp .github/copilot-instructions.md your-project/.github/

# Global
cp .github/copilot-instructions.md ~/.copilot/copilot-instructions.md
```

### Codex

```bash
cp AGENTS.md ~/.codex/AGENTS.md
```

### Gemini CLI

```bash
gemini extensions install https://github.com/FasterApiWeb/leash-secrets
```

### Windsurf

```bash
cp skills/leash-secrets.md your-project/.windsurf/rules/leash-secrets.md
```

### Cline

```bash
cp skills/leash-secrets.md your-project/.clinerules/leash-secrets.md
```

### Kiro

```bash
cp skills/leash-secrets.md your-project/.kiro/steering/leash-secrets.md
```

### Aider

Leash works with Aider through the `AGENTS.md` convention:

```bash
cp AGENTS.md your-project/AGENTS.md
```

### Any agent that reads AGENTS.md

Just copy `AGENTS.md` to your project root. CodeWhale, Swival, VS Code with Codex extension, and many others will pick it up.

</details>

## Commands

| Command | What it does |
|---------|-------------|
| `/leash-secrets [patrol\|sweep\|lockdown\|off]` | Set mode or show current mode |
| `/leash-secrets-scan` | Scan current file or staged diff for secrets |
| `/leash-secrets-audit` | Full repo audit — every file, every pattern, scored A–F |
| `/leash-secrets-fix` | Auto-fix detected secrets (replace with env vars) |
| `/leash-secrets-report` | Generate a shareable security report |
| `/leash-secrets-help` | Quick reference |

### Modes

| Mode | Behavior |
|------|----------|
| `patrol` *(default)* | Scan everything the agent writes. Block criticals, warn on warnings. |
| `sweep` | On-demand scanning only. Use with `/leash-secrets-scan`. |
| `lockdown` | Block ALL findings, including warnings. For pre-release audits. |
| `off` | Disable leash-secrets. Your secrets are your problem now. |

## Patterns

Leash Secrets detects **70+ secret types** across 11 provider categories:

| Category | Secrets Detected |
|----------|-----------------|
| **AWS** | Access Key ID, Secret Access Key, Session Token, MWS Key |
| **GCP** | API Key, OAuth Client Secret, Service Account Key, Firebase Config |
| **Azure** | Storage Account Key, Client Secret, Connection String, SAS Token |
| **GitHub & Git** | PAT (classic + fine-grained), OAuth, App tokens, GitLab PAT, Bitbucket |
| **AI Providers** | OpenAI, Anthropic, Cohere, Hugging Face, Replicate |
| **Payments** | Stripe (live/test/webhook), PayPal, Square |
| **Databases** | PostgreSQL, MySQL, MongoDB, Redis, Supabase, PlanetScale |
| **Messaging** | Slack (bot/user/webhook), Discord, Twilio, SendGrid, Mailgun, Telegram |
| **CI/CD** | npm, PyPI, Docker Hub, Vercel, Netlify, Heroku, Terraform, CircleCI |
| **Crypto** | RSA, OpenSSH, EC, DSA, PGP private keys, PKCS12 passwords |
| **Generic** | Passwords, secrets, API keys, JWT secrets, Bearer tokens, encryption keys |

Every pattern includes:
- **Regex** for detection
- **Risk assessment** explaining what an attacker can do
- **Fix** with the specific env var name and approach
- **Rotation URL** where applicable

### Adding Custom Patterns

Leash Secrets patterns are extensible JSON files. Add your own:

```json
{
  "provider": "my-company",
  "display_name": "Internal Services",
  "patterns": [
    {
      "id": "internal-api-key",
      "name": "Internal API Key",
      "severity": "critical",
      "regex": "myco_[a-zA-Z0-9]{32}",
      "description": "Internal service API key",
      "risk": "Access to internal APIs",
      "fix": "Use INTERNAL_API_KEY environment variable"
    }
  ]
}
```

Save to `patterns/my-company.json` and add it to `patterns/index.json`. See [docs/patterns/custom-patterns.md](docs/patterns/custom-patterns.md) for the full schema.

## Benchmarks

Published labeled corpus — no hand-wavy percentages.

| Resource | Link |
|----------|------|
| **Raw case labels** | [`benchmarks/corpus/cases.json`](benchmarks/corpus/cases.json) |
| **Fixture files** | [`benchmarks/corpus/samples/`](benchmarks/corpus/samples/) |
| **Last run results** | [`benchmarks/results.json`](benchmarks/results.json) |

```bash
npm run benchmark:corpus   # reproduce locally
```

| Metric (pattern scanner) | Result |
|--------------------------|-------:|
| Recall (30 positives) | **100%** |
| False positives (8 negatives) | **0%** |
| Documented known gaps | **3** (multiline, base64-only, truncated tokens) |

This measures **regex detection** in `leash-secrets scan` — reproducible, committed, verifiable. We do not publish unverified LLM-prompt comparison numbers. See [benchmarks/README.md](benchmarks/README.md) and [docs/reference/benchmarks.md](docs/reference/benchmarks.md).

## How It Works

1. **Install** drops a skill/rule file into your AI agent
2. **Skill** instructs the agent to run the Leash Protocol on every code change:
   - **SCAN** every line for 70+ secret patterns
   - **CLASSIFY** findings as critical/warning/safe
   - **BLOCK** critical findings with redacted output and specific fixes
   - **WARN** on possible secrets and ask for confirmation
3. **Pre-commit hook** as a backup catches anything the agent missed
4. **Pattern library** is extensible JSON — add your own patterns, contribute upstream

No server, no API, no telemetry. Leash is a prompt and a pattern library. Everything runs locally.

```
┌──────────────┐    ┌──────────┐    ┌───────────────┐
│  AI Agent    │───▶│ leash-   │───▶│  Your Code    │
│  writes code │    │ secrets  │    │  (no secrets)  │
└──────────────┘    └──────────┘    └───────────────┘
                         │
                    ┌────┴────┐
                    │ 🔴 STOP │  ← blocks before
                    │ 🟡 WARN │     the code exists
                    │ 🟢 PASS │
                    └─────────┘
```

## Why Leash Secrets and Not Just truffleHog/gitleaks/git-secrets?

Those tools are excellent. Use them too. Leash is different because:

| Feature | truffleHog / gitleaks | leash-secrets |
|---------|:--------------------:|:-----:|
| Scans committed code | ✅ | ✅ (via audit) |
| Scans git history | ✅ | ✅ (via audit) |
| Pre-commit hook | ✅ | ✅ |
| **Catches secrets during AI code generation** | ❌ | ✅ |
| **Understands code context** (test vs prod) | ❌ | ✅ |
| **Provides contextual fixes** | ❌ | ✅ |
| **Works inside 20+ AI agents** | ❌ | ✅ |
| **No installation beyond a text file** | ❌ | ✅ |
| **Extensible pattern JSON anyone can contribute** | varies | ✅ |

Use leash-secrets + truffleHog/gitleaks for defense in depth. Leash Secrets catches secrets at creation. Traditional tools catch anything that slips through.

## Privacy

Leash Secrets does not phone home. No telemetry, no analytics, no accounts, no backend. The skill is a markdown file. The patterns are JSON files. The hook is a bash script. Everything runs locally, evaluated by your AI agent's own context window.

Network calls happen only during install (fetching files from GitHub) and are documented in [SECURITY.md](SECURITY.md).

## Use It Everywhere

### CLI

```bash
npm install -g leash-secrets

leash-secrets scan .                    # Scan current directory
leash-secrets scan src/ --verbose       # With risk details
leash-secrets scan config.yml --json    # JSON output for CI
leash-secrets report .                  # Markdown security report
leash-secrets patterns                  # List all 71 patterns
leash-secrets validate                  # Validate pattern files
```

### GitHub Action

Add to `.github/workflows/secret-scan.yml`:

```yaml
name: Secret Scan
on: [push, pull_request]

jobs:
  leash-secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: FasterApiWeb/leash-secrets/action@leash-secrets-v1.1.0
```

See [action/README.md](action/README.md) for configuration options (`scan-mode`, `fail-on`, `exclude`, etc.).

### GitLab CI

```yaml
include:
  - remote: 'https://raw.githubusercontent.com/FasterApiWeb/leash-secrets/main/action/gitlab-ci-template.yml'
```

### VS Code Extension

Packaged and ready, marketplace publish pending:

```bash
npm run package-extension
code --install-extension vscode-extension/leash-secrets-vscode-*.vsix
```

Real-time inline diagnostics as you type, workspace scanning, and a status bar indicator. See [vscode-extension/README.md](vscode-extension/README.md).

### Programmatic API

```javascript
const { loadPatterns, scanFile, scanString } = require('leash-secrets');
const findings = scanFile('config.py');
// or
const findings = scanString('api_key = "sk_live_abc123..."', { filename: 'app.py' });

findings.forEach(f => {
  console.log(`${f.severity}: ${f.pattern.name} at line ${f.line}`);
});
```

## For Contributors

### Local Development Setup

```bash
git clone https://github.com/FasterApiWeb/leash-secrets.git
cd leash-secrets

# Run tests (zero dependencies, no install needed)
make test

# Scan the repo itself for secrets
make scan

# Serve docs locally at http://127.0.0.1:8000
make docs-serve

# See all available commands
make help
```

### Test Locally Before Submitting a PR

```bash
make test          # Validate patterns + run regex tests
make lint          # Check shell scripts
make scan          # Dogfood: scan own repo
make docs          # Build docs site
```

### How the CI/CD Pipeline Works

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| **CI** | Every push & PR | Tests on Node 18/20/22, shell linting, dogfood scan |
| **Validate Patterns** | PR touching `patterns/` | Validates pattern schema and regex tests |
| **Release** | Push to main | release-please creates release PR, publishes to npm, uploads assets |
| **Deploy Docs** | Push to main (docs changed) | Builds MkDocs, deploys to GitHub Pages |

### Conventional Commits

We use [Conventional Commits](https://conventionalcommits.org) for automated releases:

```
feat: add Datadog API key pattern          → minor version bump
fix: reduce false positives for JWT        → patch version bump
pattern: add Twilio phone SID detection    → patch version bump
docs: update installation guide            → no version bump
```

## Publishing & Releasing

### npm

Releases are automated via release-please. When you merge a PR with conventional commits:

1. release-please opens a "Release PR" bumping the version
2. Merging the Release PR triggers:
   - `npm publish` with provenance
   - GitHub Release with `.tar.gz` and `.zip` assets
   - CHANGELOG.md update

Manual publish (maintainers only):

```bash
npm login
npm publish --access public
```

### VS Code Marketplace

```bash
cd vscode-extension
npx @vscode/vsce package             # Creates .vsix
npx @vscode/vsce publish             # Publish (requires PAT)
```

### GitHub Pages (Docs)

Automatic on push to main. Manual trigger via Actions > Deploy Docs > Run workflow.

Docs URL: **https://fasterapiweb.github.io/leash-secrets**

## Contributing

Leash Secrets' power grows with every pattern contributed. See [CONTRIBUTING.md](CONTRIBUTING.md) for:

- **Adding patterns** — the most impactful contribution. Found a secret type leash-secrets misses? Add the regex.
- **Improving detection** — reduce false positives, add allowlist rules
- **Agent adapters** — add support for new AI agents
- **Documentation** — examples, translations, guides
- **Testing** — pattern validation, edge cases

## Used by

Projects using leash-secrets for AI agent secret detection:

| Project | Description |
|---------|-------------|
| [**LibreRing**](https://github.com/FasterApiWeb/laughing-chainsaw) | Open-source Oura Ring client — BLE, HealthKit, Supabase sync |

[Open a PR](CONTRIBUTING.md) to add your project.

## Credibility & hygiene

This repo is dogfooded — the tool scans itself on every PR and push.

| Check | Where |
|-------|-------|
| Pattern + fixture tests | [CI — Test](https://github.com/FasterApiWeb/leash-secrets/actions/workflows/ci.yml) (Node 18/20/22) |
| Shell script lint | [CI — Shell Scripts](https://github.com/FasterApiWeb/leash-secrets/actions/workflows/ci.yml) |
| Dogfood scan (no criticals in source) | [CI — Dogfood](https://github.com/FasterApiWeb/leash-secrets/actions/workflows/ci.yml) |
| Reproducible benchmark | `npm run benchmark:corpus` + `npm test` |
| Install smoke test | `npm run verify` |

```bash
npm run verify   # all local hygiene checks
npm run benchmark:corpus
npm test
node bin/leash-secrets.js scan src/ scripts/ hooks/ bin/
```

Global install: `npm install -g leash-secrets` · curl installer: see [Installation](docs/getting-started/installation.md)

## Roadmap

- [x] **leash-secrets-ci** — GitHub Action / GitLab CI integration
- [ ] **leash-secrets-vscode** — VS Code extension (packaged; marketplace publish pending)
- [ ] **leash-secrets-dashboard** — team-wide secret exposure metrics
- [ ] **Pattern marketplace** — community-contributed pattern packs
- [ ] **Entropy detection** — catch secrets that don't match known patterns
- [ ] **Multi-language fix templates** — auto-fix for 15+ languages

## Support the project

If leash-secrets saved you a rotation, a star helps others find it before they leak.

---

**Docs:** [fasterapiweb.github.io/leash-secrets](https://fasterapiweb.github.io/leash-secrets) · **Maintainers:** [EshwarCVS](https://github.com/EshwarCVS) / [FasterApiWeb](https://github.com/FasterApiWeb) · **License:** MIT
