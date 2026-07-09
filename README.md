<p align="center">
  <img src="docs/assets/leash-secrets-logo.png" alt="leash-secrets" width="200" />
</p>

<h1 align="center">leash-secrets</h1>

<p align="center">
  <strong>your AI writes fast. leash-secrets makes sure it doesn't run away with your secrets.</strong>
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#before--after">See it</a> ·
  <a href="#commands">Commands</a> ·
  <a href="#patterns">Patterns</a> ·
  <a href="#benchmarks">Benchmarks</a> ·
  <a href="#contributing">Contribute</a>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://www.npmjs.com/package/leash-secrets"><img src="https://img.shields.io/npm/v/leash-secrets.svg" alt="npm version" /></a>
  <a href="https://github.com/FasterApiWeb/leash-secrets/actions/workflows/ci.yml"><img src="https://github.com/FasterApiWeb/leash-secrets/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/FasterApiWeb/leash-secrets/stargazers"><img src="https://img.shields.io/github/stars/FasterApiWeb/leash-secrets?style=social" alt="Stars" /></a>
  <a href="https://github.com/FasterApiWeb/leash-secrets/issues"><img src="https://img.shields.io/github/issues/FasterApiWeb/leash-secrets" alt="Issues" /></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
</p>

<p align="center">
  <img src="docs/assets/demo.svg" alt="leash-secrets blocking a Stripe live key in an AI agent session" width="760" />
</p>

---

AI coding agents write code at lightning speed. GPT, Claude, Copilot — they're incredible at generating code. But they have a problem: **they don't know your secrets are secret.**

Every day, AI-generated code pushes API keys, database passwords, and cloud credentials straight into public repositories. GitHub's own secret scanning catches [millions of leaked secrets per year](https://github.blog/security/secret-scanning/). And with AI writing more code than ever, the problem is accelerating.

**Other tools catch secrets after they're committed. Leash Secrets catches them while the AI is still typing.**

> **Defense layer 0:** Use leash-secrets with gitleaks/truffleHog/GitGuardian — not instead of them. Leash catches secrets at creation; traditional scanners catch anything that slips into git history.

Leash Secrets is a skill/plugin for [Cursor](https://cursor.com), [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Codex](https://openai.com/index/codex/), [GitHub Copilot](https://github.com/features/copilot), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Windsurf](https://windsurf.com), [Cline](https://github.com/cline/cline), and 20+ other AI agents. Install once. Your agent scans every line it writes for exposed secrets — API keys, tokens, passwords, private keys — and blocks them before they hit your codebase.

## Before / After

You ask your AI agent to set up a Stripe integration. Without leash-secrets:

```python
import stripe

stripe.api_key = "sk_live_" + "YourActualKeyWouldBeHere1234567890"

def create_payment(amount, currency="usd"):
    return stripe.PaymentIntent.create(
        amount=amount,
        currency=currency,
    )
```

Your production Stripe key. In your source code. One `git push` from being public.

With leash-secrets:

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

The agent stops. Shows the risk. Provides the fix. Your key never reaches the codebase.

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

## Install

**One command. Finds every agent on your machine. Installs for each.**

```bash
# macOS · Linux · WSL · Git Bash
curl -fsSL https://raw.githubusercontent.com/FasterApiWeb/leash-secrets/main/scripts/install.sh | bash
```

```powershell
# Windows · PowerShell 5.1+
irm https://raw.githubusercontent.com/FasterApiWeb/leash-secrets/main/scripts/install.ps1 | iex
```

~15 seconds. Skips agents you don't have. Safe to re-run.

> [!TIP]
> **Active by default.** Leash Secrets starts in `patrol` mode — it scans everything your agent writes and blocks critical secrets automatically. No command needed. Use `/leash-secrets off` to disable.

<details>
<summary><strong>Install for one agent, or any of 20+ others</strong></summary>

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

Leash Secrets is validated with a reproducible fixture suite in this repo (`npm test`). For broader historical benchmarking against revoked-secret corpora, see the methodology page.

| Metric | No scanning | "Check for secrets" prompt | Leash Secrets |
|--------|----------:|---------------------------:|--------------:|
| **Secrets caught** | 0% | 41% | **94%** |
| **False positives** | 0 | 12% | **3%** |
| **Auto-fix accuracy** | N/A | 22% | **89%** |
| **Agent speed impact** | baseline | +2% | **+5%** |

Leash Secrets catches 94% in controlled benchmark runs because it uses **specific regex patterns** rather than relying on the LLM's general judgment. The 6% miss rate is mostly novel/unusual secret formats — contribute patterns to close the gap.

> [!NOTE]
> Reproducible local validation: `npm test` and `node scripts/benchmark-summary.js`  
> Full methodology and limitations: [docs/reference/benchmarks.md](docs/reference/benchmarks.md)

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
| Reproducible benchmark | `npm test` + `node scripts/benchmark-summary.js` |
| Install smoke test | `npm run verify` |

```bash
npm run verify   # all local hygiene checks
npm test
node scripts/benchmark-summary.js
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

## Star This Repo

Every star helps another developer find leash-secrets before their secrets find the internet.

---

<p align="center">
  <a href="CONTRIBUTING.md">Contributing</a> ·
  <a href="SECURITY.md">Security</a> ·
  <a href="https://fasterapiweb.github.io/leash-secrets">Documentation</a> ·
  <a href="action/README.md">GitHub Action</a> ·
  <a href="https://github.com/FasterApiWeb/leash-secrets/issues">Issues</a>
</p>

<p align="center">
  MIT — free like the secrets you almost leaked.
</p>
