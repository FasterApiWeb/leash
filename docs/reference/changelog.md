# Changelog

For the full changelog, see [CHANGELOG.md on GitHub](https://github.com/FasterApiWeb/leash-secrets/blob/main/CHANGELOG.md).

## [1.0.0] — 2026-07-07

### Added

- Core Leash Secrets Protocol — always-on secret detection skill for AI coding agents
- **71 detection patterns** across 11 provider categories
- Agent support for **Cursor, Claude Code, Codex, GitHub Copilot, Gemini CLI, Windsurf, Cline**, and any agent that reads `AGENTS.md`
- Commands: `/leash-secrets`, `/leash-secrets-scan`, `/leash-secrets-audit`, `/leash-secrets-fix`, `/leash-secrets-report`, `/leash-secrets-help`
- Modes: `patrol` (default), `sweep`, `lockdown`, `off`
- Pre-commit git hook
- Universal installer for macOS, Linux, WSL, and Windows
- Extensible JSON pattern schema with validation
- Pattern tests (29 test cases)
- MkDocs documentation site
- GitHub Actions CI/CD pipeline
- Automated releases via release-please
- npm publishing workflow
