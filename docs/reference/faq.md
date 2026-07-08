# FAQ

## General

### What is leash-secrets?

Leash Secrets is an AI agent skill that catches exposed secrets (API keys, tokens, passwords, private keys) before they make it into your codebase. It works inside your AI coding agent — Cursor, Claude Code, Codex, Copilot, and 20+ others.

### How is leash-secrets different from truffleHog or gitleaks?

Those tools scan committed code and git history. Leash Secrets catches secrets **during code generation** — before the code is ever written to a file. Use both for defense in depth.

### Does leash-secrets replace my existing security tools?

No. Leash Secrets adds a layer at the point of code creation. Use it alongside pre-commit hooks, CI secret scanning, and tools like truffleHog/gitleaks.

### Does leash-secrets slow down my AI agent?

About 5% due to additional prompt context. The skill adds ~2KB to the agent's context window. Most users don't notice any difference.

## Installation

### Which AI agents does leash-secrets support?

Cursor, Claude Code, Codex, GitHub Copilot, Gemini CLI, Windsurf, Cline, Kiro, Aider, CodeWhale, Swival, and any agent that reads `AGENTS.md`.

### Can I use leash-secrets with multiple agents?

Yes. The universal installer detects all agents on your machine and installs for each. You can also install manually for specific agents.

### Does leash-secrets need an internet connection?

Only during installation (to download files from GitHub). After that, everything runs locally with zero network calls.

## Detection

### How many secret types does leash-secrets detect?

71 patterns across 11 categories: AWS, GCP, Azure, GitHub, AI providers, payments, databases, messaging, CI/CD, cryptographic keys, and generic secrets.

### What if leash-secrets misses a secret?

[Open a pattern request](https://github.com/FasterApiWeb/leash-secrets/issues/new?template=new-pattern.yml) or add the pattern yourself. See [Custom Patterns](../patterns/custom-patterns.md).

### What if leash-secrets flags something that isn't a secret?

[Report the false positive](https://github.com/FasterApiWeb/leash-secrets/issues/new?template=false-positive.yml). We'll refine the pattern.

### Does leash-secrets detect secrets in git history?

The `/leash-secrets-audit` command can check git history for previously committed secrets. For thorough history scanning, pair leash-secrets with truffleHog or gitleaks.

## Privacy

### Does leash-secrets send my code anywhere?

No. Leash Secrets is a prompt (markdown file) and a pattern library (JSON files). Everything runs locally in your agent's context window. Zero telemetry, zero network calls.

### Does leash-secrets store detected secrets?

No. Detected secrets are shown redacted (first 6 + last 4 characters) and immediately discarded. Nothing is logged or stored.

## Contributing

### How can I contribute?

The most impactful contribution is adding new secret patterns. See [Contributing](../contributing/index.md).

### Can I add patterns for my company's internal services?

Yes. Create a custom pattern file and keep it in your project. See [Custom Patterns](../patterns/custom-patterns.md). If it's a public service, contribute it upstream.
