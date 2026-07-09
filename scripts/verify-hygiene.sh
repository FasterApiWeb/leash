#!/usr/bin/env bash
set -euo pipefail

# Pre-launch hygiene checks — run before publishing or posting.
# Exit 0 = all checks passed.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
BOLD='\033[1m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}✓${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; FAILED=1; }

FAILED=0

echo ""
echo -e "${BOLD}leash-secrets hygiene verification${NC}"
echo ""

# Pattern + fixture tests
if npm test >/dev/null 2>&1; then
  pass "npm test (patterns + fixtures)"
else
  fail "npm test (patterns + fixtures)"
fi

# Reproducible benchmark summary
if node scripts/benchmark-summary.js >/dev/null 2>&1; then
  pass "benchmark-summary.js"
else
  fail "benchmark-summary.js"
fi

# Dogfood scan (exclude fixtures/docs with known examples)
if node bin/leash-secrets.js scan src/ scripts/ hooks/ bin/ >/dev/null 2>&1; then
  pass "dogfood scan (src/, scripts/, hooks/, bin/)"
else
  fail "dogfood scan (src/, scripts/, hooks/, bin/)"
fi

# Shell script syntax
if bash -n scripts/install.sh 2>/dev/null; then
  pass "install.sh syntax (bash -n)"
else
  fail "install.sh syntax (bash -n)"
fi

if bash -n hooks/pre-commit.sh 2>/dev/null; then
  pass "pre-commit.sh syntax (bash -n)"
else
  fail "pre-commit.sh syntax (bash -n)"
fi

# npm pack dry-run (publishable tarball)
if npm pack --dry-run >/dev/null 2>&1; then
  pass "npm pack --dry-run"
else
  fail "npm pack --dry-run"
fi

# Local pack install smoke test (no global install required)
TMPDIR_PACK="$(mktemp -d)"
trap 'rm -rf "$TMPDIR_PACK"' EXIT
if npm pack --silent -C "$ROOT" >/dev/null 2>&1; then
  TGZ="$(ls -1 "$ROOT"/leash-secrets-*.tgz 2>/dev/null | tail -1)"
  if [[ -n "$TGZ" ]] && npm install -g "$TGZ" --prefix "$TMPDIR_PACK" >/dev/null 2>&1; then
  if "$TMPDIR_PACK/bin/leash-secrets" --help >/dev/null 2>&1 || \
     "$TMPDIR_PACK/bin/leash-secrets" scan tests/fixtures/clean.py >/dev/null 2>&1; then
      pass "local tarball install + CLI runs"
    else
      fail "local tarball install + CLI runs"
    fi
    rm -f "$TGZ"
  else
    fail "local tarball install + CLI runs"
  fi
else
  fail "npm pack"
fi

# Install script version matches package.json
PKG_VER="$(node -p "require('./package.json').version")"
INSTALL_VER="$(grep -E '^VERSION=' scripts/install.sh | head -1 | cut -d'"' -f2)"
if [[ "$PKG_VER" == "$INSTALL_VER" ]]; then
  pass "install.sh VERSION matches package.json ($PKG_VER)"
else
  fail "install.sh VERSION ($INSTALL_VER) != package.json ($PKG_VER)"
fi

# No "Made with Cursor" trailer (credibility hygiene)
if rg -qi 'made with cursor' . \
  --glob '!node_modules' --glob '!.git' --glob '!scripts/verify-hygiene.sh' 2>/dev/null; then
  fail "found 'Made with Cursor' text in repo"
else
  pass "no 'Made with Cursor' trailer text"
fi

echo ""
if [[ "$FAILED" -eq 0 ]]; then
  echo -e "${GREEN}${BOLD}All hygiene checks passed.${NC}"
  exit 0
else
  echo -e "${RED}${BOLD}Some checks failed.${NC}"
  exit 1
fi
