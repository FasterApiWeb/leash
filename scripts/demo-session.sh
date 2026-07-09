#!/usr/bin/env bash
# Live demo session — real install + scan commands only.
# Recorded via: bash scripts/record-demo.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEMO_HOME="$(mktemp -d)"
export HOME="$DEMO_HOME"
export NPM_CONFIG_PREFIX="$DEMO_HOME/npm-global"
export PATH="$NPM_CONFIG_PREFIX/bin:$PATH"
export COLUMNS=100

cd "$ROOT"

show() {
  printf '\n$ %s\n' "$*"
  sleep 1.4
}

# ── Install CLI (npm global, isolated prefix) ─────────────────────────
show npm pack --silent
npm pack --silent
TGZ="$(ls -1 "$ROOT"/leash-secrets-*.tgz | tail -1)"

show "npm install -g ${TGZ##*/}"
npm install -g "$TGZ"
rm -f "$TGZ"
sleep 0.8

# ── Usage ─────────────────────────────────────────────────────────────
show leash-secrets scan tests/fixtures/clean.py
leash-secrets scan tests/fixtures/clean.py
sleep 0.8

show leash-secrets scan tests/fixtures/has-secrets.py
leash-secrets scan tests/fixtures/has-secrets.py || true
sleep 0.8

# ── Agent install (local installer, isolated HOME) ────────────────────
show "bash scripts/install.sh --only cursor"
bash scripts/install.sh --only cursor
sleep 0.5

show "ls ~/.cursor/rules/"
ls -1 "$HOME/.cursor/rules/"
