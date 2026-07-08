# Development Setup

## Prerequisites

- Node.js 18+
- Git

## Clone and Setup

```bash
git clone https://github.com/FasterApiWeb/leash-secrets.git
cd leash-secrets
```

No `npm install` needed for the core project — leash-secrets has zero runtime dependencies.

## Project Structure

```
leash-secrets/
├── skills/              # AI agent skill files (the core product)
│   ├── leash-secrets.md         # Main Leash Secrets Protocol
│   ├── leash-secrets-scan.md    # /leash-secrets-scan command
│   ├── leash-secrets-audit.md   # /leash-secrets-audit command
│   ├── leash-secrets-fix.md     # /leash-secrets-fix command
│   └── leash-secrets-report.md  # /leash-secrets-report command
├── patterns/            # Secret detection patterns (extensible JSON)
│   ├── index.json       # Pattern registry
│   ├── schema.json      # JSON Schema for patterns
│   ├── aws.json         # AWS patterns
│   ├── ...              # Other provider patterns
│   └── generic.json     # Generic patterns
├── hooks/               # Git hooks
│   ├── hooks.json       # Claude Code hooks config
│   └── pre-commit.sh    # Pre-commit secret scanner
├── scripts/             # Tooling
│   ├── install.sh       # Universal installer (macOS/Linux)
│   ├── install.ps1      # Windows installer
│   └── check-patterns.js # Pattern validator
├── tests/               # Tests
│   ├── test-patterns.js # Pattern test suite
│   └── fixtures/        # Test fixtures
├── docs/                # MkDocs documentation
├── .cursor/rules/       # Cursor agent rule
├── .github/             # GitHub config (CI, templates, etc.)
├── AGENTS.md            # Universal agent instructions
└── mkdocs.yml           # Documentation site config
```

## Running Validation

```bash
# Validate all pattern files against schema
node scripts/check-patterns.js

# Run pattern regex tests
node tests/test-patterns.js

# Run both (same as npm test)
npm test
```

## Testing the Skill

The best way to test leash-secrets is to use it:

1. Copy `.cursor/rules/leash-secrets.mdc` to your test project
2. Open the project in Cursor
3. Ask the agent to write code with intentional secrets
4. Verify leash-secrets catches them

## Building the Docs

```bash
pip install mkdocs-material mkdocs-minify-plugin mkdocs-git-revision-date-localized-plugin
mkdocs serve   # Local preview at http://127.0.0.1:8000
mkdocs build   # Build to site/
```

## Architecture Principles

Leash Secrets follows SOLID principles:

- **Single Responsibility**: Each pattern file covers one provider. Each skill file handles one command.
- **Open/Closed**: Add new patterns by creating JSON files — no modification of existing code needed.
- **Liskov Substitution**: All agent adapters deliver the same Leash Secrets Protocol, regardless of format.
- **Interface Segregation**: Commands are separate skills — agents only load what they support.
- **Dependency Inversion**: The skill depends on the protocol abstraction, not on specific regex implementations. Patterns are injected via JSON, not hardcoded.
