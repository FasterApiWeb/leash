# Modes

Leash Secrets has four operating modes. Switch with `/leash-secrets <mode>`.

## Patrol (Default)

```
/leash-secrets patrol
```

The recommended mode for daily development.

- **Scans** everything the agent writes and touches
- **Blocks** critical findings (known key prefixes, private keys, connection strings)
- **Warns** on possible secrets (generic variable names with long values)
- **Passes** safe values silently (placeholders, test keys)

## Sweep

```
/leash-secrets sweep
```

On-demand scanning only. The agent doesn't scan automatically — you trigger scans with `/leash-secrets-scan`.

Use when:

- Working on code that intentionally handles secret-like patterns (e.g., a secret scanner itself)
- Performance-sensitive sessions where you want to minimize overhead
- You prefer manual control

## Lockdown

```
/leash-secrets lockdown
```

Maximum security. Blocks **all** findings, including warnings.

Use when:

- Preparing a release
- Running a security audit
- Working on code that handles sensitive data
- Onboarding a new team member to security practices

## Off

```
/leash-secrets off
```

Disables leash-secrets entirely. The agent will not scan for secrets.

!!! warning "Not recommended"
    The pre-commit hook still runs as a backup, but the agent-level detection — leash-secrets' primary value — is disabled.

## Mode Comparison

| Behavior | Patrol | Sweep | Lockdown | Off |
|----------|:------:|:-----:|:--------:|:---:|
| Auto-scan on write | ✅ | ❌ | ✅ | ❌ |
| Block criticals | ✅ | ✅ | ✅ | ❌ |
| Block warnings | ❌ | ❌ | ✅ | ❌ |
| On-demand scan | ✅ | ✅ | ✅ | ❌ |
| Pre-commit hook | ✅ | ✅ | ✅ | ✅ |

## Persisting Modes

The mode resets each session. To set a default:

Set the `LEASH_SECRETS_DEFAULT_MODE` environment variable:

```bash
export LEASH_SECRETS_DEFAULT_MODE=lockdown
```

Or add it to your shell profile (`~/.zshrc`, `~/.bashrc`).
