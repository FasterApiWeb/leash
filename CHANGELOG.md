# Changelog

All notable changes to leash-secrets will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
