# Agent Portability

Leash Secrets works with any AI coding agent that supports custom instructions, rules, or skills. Here's the mapping:

## Agent → File Matrix

| Agent | File | Path | Method |
|-------|------|------|--------|
| **Cursor** | `leash-secrets.mdc` | `.cursor/rules/leash-secrets.mdc` | Always-apply rule |
| **Claude Code** | `leash-secrets.md` | `~/.claude/skills/leash-secrets.md` or project `CLAUDE.md` | Skill or project doc |
| **Codex** | `AGENTS.md` | `~/.codex/AGENTS.md` or project root | Agent instructions |
| **GitHub Copilot** | `copilot-instructions.md` | `.github/copilot-instructions.md` | Copilot custom instructions |
| **Gemini CLI** | Extension | `gemini extensions install` | CLI extension |
| **Windsurf** | `leash-secrets.md` | `.windsurf/rules/leash-secrets.md` | Rule file |
| **Cline** | `leash-secrets.md` | `.clinerules/leash-secrets.md` | Rule file |
| **Kiro** | `leash-secrets.md` | `.kiro/steering/leash-secrets.md` | Steering file |
| **Aider** | `AGENTS.md` | Project root | Convention |
| **CodeWhale** | `AGENTS.md` | Project root | Convention |
| **Swival** | `AGENTS.md` | Project root or `~/.config/swival/` | Convention |
| **VS Code + Codex** | `AGENTS.md` | Project root or `~/.codex/` | Convention |
| **OpenClaw** | `leash-secrets.md` | `.openclaw/skills/` | Skill |

## Universal Compatibility

For agents not listed above, `AGENTS.md` is the universal fallback. Most modern AI coding agents read `AGENTS.md` from the project root. Copy it there and leash-secrets works.

## Global vs Project-Level

| Scope | When to use | How |
|-------|-------------|-----|
| **Global** | Every project on your machine | Copy to agent's global config directory (see paths above with `~/`) |
| **Project** | Specific project only | Copy to project root or project's agent config directory |
| **Both** | Recommended | Global for personal projects, project-level for team repos |

## What Each File Contains

All files contain the same core Leash Secrets Protocol, adapted to each agent's format:

- **`.mdc` files** (Cursor): Include frontmatter with `alwaysApply: true` and glob patterns
- **`.md` files** (most agents): Markdown with the protocol, patterns, and commands
- **`AGENTS.md`**: Compact version of the protocol for agents that read project-root instructions
- **Extensions** (Gemini): Package format wrapping the skill files

The core detection logic is identical across all formats. Only the delivery mechanism differs.
