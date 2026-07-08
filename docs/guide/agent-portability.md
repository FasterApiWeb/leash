# Agent Portability

Leash Secrets works with any AI coding agent that supports custom instructions, rules, or skills.

## Support Matrix

| Agent | File | Path | Method |
|-------|------|------|--------|
| **Cursor** | `leash-secrets.mdc` | `.cursor/rules/leash-secrets.mdc` | Always-apply rule |
| **Claude Code** | `leash-secrets.md` | `~/.claude/skills/` or `CLAUDE.md` | Skill or project doc |
| **Codex** | `AGENTS.md` | `~/.codex/` or project root | Agent instructions |
| **GitHub Copilot** | `copilot-instructions.md` | `.github/copilot-instructions.md` | Custom instructions |
| **Gemini CLI** | Extension | `gemini extensions install` | CLI extension |
| **Windsurf** | `leash-secrets.md` | `.windsurf/rules/leash-secrets.md` | Rule file |
| **Cline** | `leash-secrets.md` | `.clinerules/leash-secrets.md` | Rule file |
| **Kiro** | `leash-secrets.md` | `.kiro/steering/leash-secrets.md` | Steering file |
| **Aider** | `AGENTS.md` | Project root | Convention |
| **CodeWhale** | `AGENTS.md` | Project root | Convention |
| **Swival** | `AGENTS.md` | Project root or `~/.config/swival/` | Convention |
| **OpenClaw** | `leash-secrets.md` | `.openclaw/skills/` | Skill |

## Universal Fallback

For agents not listed above, `AGENTS.md` is the universal fallback. Most modern AI coding agents read `AGENTS.md` from the project root.

```bash
cp AGENTS.md your-project/AGENTS.md
```

## Scope: Global vs Project

| Scope | When | How |
|-------|------|-----|
| **Global** | Personal projects, solo development | Copy to agent's global config directory (paths with `~/` above) |
| **Project** | Team repos, shared codebases | Copy to project root or project agent config directory |
| **Both** | Recommended for maximum coverage | Global for personal, project-level for team repos |

## What's in Each File

All adapter files contain the same core Leash Secrets Protocol. Only the delivery format differs:

- **`.mdc`** (Cursor) — includes `alwaysApply: true` frontmatter
- **`.md`** (most agents) — standard markdown with protocol, patterns, commands
- **`AGENTS.md`** — compact version for agents that read project-root instructions

The detection logic is identical across all formats.
