#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────
# leash-secrets pre-commit hook
# Scans staged files for exposed secrets
# ──────────────────────────────────────────

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

FOUND_CRITICAL=0
FOUND_WARNING=0
FINDINGS=""

CRITICAL_PATTERNS=(
  # AWS
  '(AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}'
  # GitHub tokens
  'ghp_[0-9a-zA-Z]{36}'
  'github_pat_[0-9a-zA-Z_]{82}'
  'gho_[0-9a-zA-Z]{36}'
  'ghs_[0-9a-zA-Z]{36}'
  # GitLab
  'glpat-[0-9a-zA-Z_-]{20}'
  # OpenAI
  'sk-proj-[a-zA-Z0-9_-]{80,}'
  # Anthropic
  'sk-ant-api[0-9]{2}-[A-Za-z0-9_-]{86}-[A-Za-z0-9_-]{6}AA'
  # Stripe live keys
  'sk_live_[0-9a-zA-Z]{24,}'
  'rk_live_[0-9a-zA-Z]{24,}'
  # Stripe webhook
  'whsec_[0-9a-zA-Z]{32,}'
  # Google
  'AIza[0-9A-Za-z_-]{35}'
  # SendGrid
  'SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}'
  # Slack tokens
  'xoxb-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}'
  'xoxp-[0-9]{10,13}-[0-9]{10,13}-[0-9]{10,13}-[a-f0-9]{32}'
  # npm
  'npm_[a-zA-Z0-9]{36}'
  # Hugging Face
  'hf_[a-zA-Z0-9]{34}'
  # Private keys (no leading dashes — BSD grep treats ----- as flags)
  'BEGIN (RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY'
  # PlanetScale
  'pscale_pw_[a-zA-Z0-9_-]{43}'
  # Square
  'sq0atp-[0-9A-Za-z_-]{22}'
  # Replicate
  'r8_[a-zA-Z0-9]{38}'
  # Docker Hub
  'dckr_pat_[A-Za-z0-9_-]{28,}'
  # PyPI
  'pypi-[A-Za-z0-9_-]{100,}'
)

WARNING_PATTERNS=(
  # Generic password assignments
  'password\s*[=:]\s*["\x27][^"\x27]{8,}["\x27]'
  # Generic secret assignments
  'secret\s*[=:]\s*["\x27][^"\x27]{16,}["\x27]'
  # URLs with embedded credentials
  'https?://[^:]+:[^@]+@[^/]+'
  # Slack webhooks
  'hooks\.slack\.com/services/T[0-9A-Z]{8,}/B[0-9A-Z]{8,}/'
  # Discord webhooks
  'discord(app)?\.com/api/webhooks/[0-9]+/'
)

ALLOWLIST_PATTERNS=(
  'example\.com'
  'your-.*-here'
  'REPLACE_ME'
  'changeme'
  'password123'
  'sk_test_'
  'pk_test_'
  'TODO'
  'xxxxx'
  'dummy'
  'placeholder'
)

staged_files=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || true)

if [[ -z "$staged_files" ]]; then
  exit 0
fi

check_allowlist() {
  local line="$1"
  for pattern in "${ALLOWLIST_PATTERNS[@]}"; do
    if echo "$line" | grep -qiE "$pattern"; then
      return 0
    fi
  done
  return 1
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  [[ ! -f "$file" ]] && continue

  # Labeled benchmark/test fixtures contain intentional fake secrets
  case "$file" in
    benchmarks/corpus/*|tests/fixtures/*) continue ;;
  esac

  # Skip binary files
  if file "$file" | grep -q "binary"; then
    continue
  fi

  line_num=0
  while IFS= read -r line; do
    line_num=$((line_num + 1))

    if check_allowlist "$line"; then
      continue
    fi

    for pattern in "${CRITICAL_PATTERNS[@]}"; do
      if echo "$line" | grep -qE "$pattern"; then
        FOUND_CRITICAL=$((FOUND_CRITICAL + 1))
        matched=$(echo "$line" | grep -oE "$pattern" | head -1)
        redacted="${matched:0:6}....${matched: -4}"
        FINDINGS="${FINDINGS}\n  ${RED}🔴 CRITICAL${NC} $file:$line_num — $redacted"
        break
      fi
    done

    for pattern in "${WARNING_PATTERNS[@]}"; do
      if echo "$line" | grep -qiE "$pattern"; then
        FOUND_WARNING=$((FOUND_WARNING + 1))
        FINDINGS="${FINDINGS}\n  ${YELLOW}🟡 WARNING${NC}  $file:$line_num — possible secret"
        break
      fi
    done

  done < "$file"
done <<< "$staged_files"

if [[ $FOUND_CRITICAL -gt 0 ]]; then
  echo ""
  echo -e "${RED}${BOLD}  ⛔ LEASH-SECRETS — COMMIT BLOCKED${NC}"
  echo -e "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "  Found ${RED}$FOUND_CRITICAL critical${NC} and ${YELLOW}$FOUND_WARNING warning${NC} findings"
  echo -e "$FINDINGS"
  echo -e "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "  ${CYAN}Fix:${NC} Remove secrets and use environment variables"
  echo -e "  ${CYAN}Skip:${NC} git commit --no-verify (not recommended)"
  echo ""
  exit 1
fi

if [[ $FOUND_WARNING -gt 0 ]]; then
  echo ""
  echo -e "${YELLOW}${BOLD}  ⚠️  LEASH-SECRETS — WARNINGS${NC}"
  echo -e "$FINDINGS"
  echo -e "  ${CYAN}Proceeding with commit. Review warnings above.${NC}"
  echo ""
fi

exit 0
