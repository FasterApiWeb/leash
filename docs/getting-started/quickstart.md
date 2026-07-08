# Quick Start

## 1. Install

```bash
curl -fsSL https://raw.githubusercontent.com/FasterApiWeb/leash-secrets/main/scripts/install.sh | bash
```

## 2. Start Coding

Leash Secrets activates automatically in `patrol` mode. Just start writing code with your AI agent as usual. Leash Secrets will:

- **Block** any critical secrets (API keys, private keys, database passwords) with a fix
- **Warn** on possible secrets and ask for confirmation
- **Pass** clean code silently

## 3. Try It

Ask your AI agent to write something with a secret to see leash-secrets in action:

> "Write a Python script that calls the OpenAI API with the key sk-proj-abc123..."

The agent should stop and show a leash-secrets warning block instead of writing the secret into code.

## 4. Key Commands

| Command | What It Does |
|---------|-------------|
| `/leash-secrets` | Show current mode |
| `/leash-secrets-scan` | Scan current file or diff |
| `/leash-secrets-audit` | Full repo audit (A-F score) |
| `/leash-secrets-fix` | Auto-fix secrets (replace with env vars) |
| `/leash-secrets-report` | Generate security report |

## 5. Set Your Mode

```
/leash-secrets patrol    # Default — scan everything, block criticals
/leash-secrets lockdown  # Block ALL findings (for pre-release)
/leash-secrets sweep     # On-demand only (use with /leash-secrets-scan)
/leash-secrets off       # Disable (not recommended)
```

## Next Steps

- Read [How It Works](how-it-works.md) to understand the Leash Secrets Protocol
- Explore [Commands](../guide/commands.md) for the full command reference
- Check [Patterns](../patterns/overview.md) to see what leash-secrets detects
- Add [Custom Patterns](../patterns/custom-patterns.md) for your organization
