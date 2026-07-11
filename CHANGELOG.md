# Changelog

All notable changes to leash-secrets will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.2.2](https://github.com/FasterApiWeb/leash-secrets/compare/leash-secrets-v1.2.1...leash-secrets-v1.2.2) (2026-07-10)

### Maintenance

* release 1.2.2

## [1.2.1](https://github.com/FasterApiWeb/leash-secrets/compare/leash-secrets-v1.2.0...leash-secrets-v1.2.1) (2026-07-09)


### Bug Fixes

* stop Release CI failing on org PR policy ([#12](https://github.com/FasterApiWeb/leash-secrets/issues/12)) ([a604f85](https://github.com/FasterApiWeb/leash-secrets/commit/a604f8590805332087b2db930105cd90957515fb))

## [1.2.0](https://github.com/FasterApiWeb/leash-secrets/compare/leash-secrets-v1.1.0...leash-secrets-v1.2.0) (2026-07-09)


### Features

* publish benchmark corpus and refresh README demo ([#10](https://github.com/FasterApiWeb/leash-secrets/issues/10)) ([de23ae3](https://github.com/FasterApiWeb/leash-secrets/commit/de23ae318fe685405cad0a4b062bae338535e0bc))

## [1.1.0](https://github.com/FasterApiWeb/leash-secrets/compare/leash-secrets-v1.0.0...leash-secrets-v1.1.0) (2026-07-08)


### Features

* launch leash — AI agent skill that catches exposed secrets before they hit your codebase ([ecc999d](https://github.com/FasterApiWeb/leash-secrets/commit/ecc999db94dd111be02f57fae6c45b52d5078e84))
* launch leash — AI agent skill that catches exposed secrets before they hit your codebase ([2b2dc91](https://github.com/FasterApiWeb/leash-secrets/commit/2b2dc91a58fd89883dc5beddc251129d573ec93c))

## [1.0.0] — 2026-07-07

### Added

- Core Leash Secrets Protocol — always-on secret detection skill for AI coding agents
- 70+ secret detection patterns across 11 provider categories:
  - AWS, GCP, Azure, GitHub & Git platforms
  - AI providers (OpenAI, Anthropic, Cohere, Hugging Face, Replicate)
  - Payment providers (Stripe, PayPal, Square)
  - Databases (PostgreSQL, MySQL, MongoDB, Redis, Supabase, PlanetScale)
  - Messaging (Slack, Discord, Twilio, SendGrid, Mailgun, Telegram)
  - CI/CD (npm, PyPI, Docker Hub, Vercel, Netlify, Heroku, Terraform, CircleCI)
  - Cryptographic material (RSA, OpenSSH, EC, DSA, PGP private keys)
  - Generic patterns (passwords, API keys, JWT secrets, Bearer tokens)
- Agent support for Cursor, Claude Code, Codex, GitHub Copilot, Gemini CLI, Windsurf, Cline, and any agent that reads AGENTS.md
- Commands: `/leash-secrets`, `/leash-secrets-scan`, `/leash-secrets-audit`, `/leash-secrets-fix`, `/leash-secrets-report`, `/leash-secrets-help`
- Modes: patrol (default), sweep, lockdown, off
- Pre-commit hook for git
- Universal installer for macOS, Linux, WSL, and Windows
- Extensible JSON pattern schema for custom patterns
- Pattern validation and testing tools
- GitHub issue templates for new patterns and false positive reports
- CI workflow for pattern validation
