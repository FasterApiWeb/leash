# How It Works

## The Leash Secrets Protocol

Every time your AI agent writes, edits, or reviews code, leash-secrets runs a four-step protocol:

```mermaid
graph TD
    A[Agent writes code] --> B[1. SCAN<br/>Check every line against<br/>71 regex patterns]
    B --> C[2. CLASSIFY<br/>Critical / Warning / Safe]
    C --> D{Severity?}
    D -->|🔴 Critical| E[3. BLOCK<br/>Stop immediately<br/>Show warning block<br/>Provide specific fix]
    D -->|🟡 Warning| F[3. WARN<br/>Flag inline<br/>Ask user to confirm]
    D -->|🟢 Safe| G[3. PASS<br/>Continue silently]
    E --> H[4. FIX<br/>Replace with env var<br/>Update .env.example<br/>Update .gitignore]
    F --> H
```

### Step 1: SCAN

The agent checks every line of code it writes or touches against **71 specific regex patterns**. These patterns match known secret formats:

| Pattern Type | Example |
|-------------|---------|
| AWS Access Key | `AKIA` followed by 16 alphanumeric characters |
| GitHub PAT | `ghp_` followed by 36 alphanumeric characters |
| Stripe Live Key | `sk_live_` followed by 24+ alphanumeric characters |
| Private Key | `-----BEGIN RSA PRIVATE KEY-----` |
| OpenAI Key | `sk-proj-` followed by 80+ characters |

This is not fuzzy matching. Each pattern targets a specific, documented secret format.

### Step 2: CLASSIFY

Each match is classified by severity:

| Severity | Criteria | Action |
|----------|----------|--------|
| 🔴 **Critical** | Matches a known key prefix (`sk-`, `AKIA`, `ghp_`), PEM header, or connection string with non-placeholder password | Block the agent |
| 🟡 **Warning** | Generic variable name (`API_KEY`, `SECRET`) with a long string value | Flag and ask |
| 🟢 **Safe** | Clearly a placeholder (`your-key-here`, `changeme`, `sk_test_`) | Continue |

### Step 3: ACT

**Critical findings** produce a structured warning block:

```
⛔ LEASH-SECRETS — SECRET DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━
Type:     [what kind of secret]
File:     [where it is]
Value:    [redacted — first 6 + last 4 chars]
Risk:     [what an attacker can do]
━━━━━━━━━━━━━━━━━━━━━━━━━
FIX:      [specific remediation]
```

The agent stops writing and waits for acknowledgment.

### Step 4: FIX

For every detected secret, leash-secrets provides a language-appropriate fix:

1. **Replace** the hardcoded value with an environment variable
2. **Add** the variable to `.env.example` with a placeholder
3. **Ensure** `.env` is in `.gitignore`
4. **Suggest** the appropriate secret manager for the stack

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                     Your AI Agent                     │
│   (Cursor, Claude Code, Codex, Copilot, etc.)        │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────────┐  ┌──────────────────────┐   │
│  │  leash-secrets skill │──│  Pattern Library     │   │
│  │  (markdown)          │  │  (71 JSON patterns)  │   │
│  └──────────┬──────────┘  └──────────────────────┘   │
│             │                                         │
│  ┌──────────┴──────────┐                              │
│  │  Leash Secrets      │                              │
│  │  Protocol           │                              │
│  │  SCAN → CLASSIFY →  │                              │
│  │  ACT → FIX          │                              │
│  └─────────────────────┘                              │
│                                                       │
├──────────────────────────────────────────────────────┤
│  Pre-commit Hook (backup safety net)                  │
└──────────────────────────────────────────────────────┘
```

Leash Secrets is a **prompt-based skill**. It lives inside your agent's context window as a set of instructions. No external server, no API calls, no binary dependencies. The agent itself is the detection engine — leash-secrets tells it what to look for and how to respond.

## Defense in Depth

Leash Secrets is designed to work alongside existing security tools:

| Layer | Tool | When It Catches Secrets |
|-------|------|------------------------|
| **1. Creation** | **leash-secrets** | While the AI writes code |
| **2. Commit** | leash-secrets pre-commit hook | Before `git commit` completes |
| **3. Push** | GitHub Secret Scanning | When pushed to GitHub |
| **4. Audit** | truffleHog, gitleaks | Scanning existing repos and history |

Use all layers for maximum protection.
