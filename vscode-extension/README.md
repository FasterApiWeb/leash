# Leash for VS Code

Inline secret detection for Visual Studio Code. Highlights exposed API keys, tokens, and credentials directly in your editor.

## Features

- **Real-time scanning** — highlights secrets as you type
- **71 patterns** across 11 provider categories (AWS, GCP, Azure, GitHub, OpenAI, Stripe, databases, and more)
- **Inline diagnostics** — secrets appear in the Problems panel with severity, fix guidance, and redacted values
- **Status bar indicator** — shows active scan status and finding count
- **Workspace scan** — scan all files at once
- **Zero config** — works out of the box

## Commands

| Command | Description |
|---------|-------------|
| `Leash: Scan Current File` | Scan the active file for secrets |
| `Leash: Scan Workspace` | Scan all files in the workspace |
| `Leash: Toggle On/Off` | Enable or disable scanning |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `leash.enabled` | `true` | Enable real-time scanning |
| `leash.severity` | `warning` | Minimum severity: `critical`, `warning`, or `info` |
| `leash.scanOnSave` | `true` | Scan when files are saved |
| `leash.scanOnType` | `true` | Scan as you type (debounced) |
| `leash.excludePatterns` | `["**/node_modules/**", ...]` | Glob patterns to exclude |

## How It Works

Leash scans your code against 71 regex patterns that match known secret formats (not vague heuristics). When a match is found:

1. The secret is highlighted with an error/warning squiggle
2. A diagnostic appears in the Problems panel with:
   - Secret type and redacted value
   - Fix guidance (which env var to use)
3. The status bar shows the count of findings

## Install from Source

```bash
cd vscode-extension
npm install
npx @vscode/vsce package
code --install-extension leash-vscode-1.0.0.vsix
```
