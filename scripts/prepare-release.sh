#!/usr/bin/env bash
set -euo pipefail

# Prepare a release PR branch locally (org blocks GitHub Actions from opening PRs).
REPO="${RELEASE_PLEASE_REPO:-FasterApiWeb/leash-secrets}"
TOKEN="${GITHUB_TOKEN:-$(gh auth token 2>/dev/null || true)}"

if [[ -z "$TOKEN" ]]; then
  echo "Set GITHUB_TOKEN or run: gh auth login"
  exit 1
fi

echo "→ Preparing release PR for ${REPO}..."
npx --yes release-please@latest release-pr \
  --repo-url="https://github.com/${REPO}" \
  --token="${TOKEN}"

# release-please does not always bump VERSION= in install.sh
BRANCH="release-please--branches--main--components--leash-secrets"
PKG_VER="$(gh api "repos/${REPO}/contents/package.json?ref=${BRANCH}" --jq '.content' | tr -d '\n' | base64 -d | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).version")"
INSTALL_SH="$(gh api "repos/${REPO}/contents/scripts/install.sh?ref=${BRANCH}" --jq '.content' | tr -d '\n' | base64 -d)"
INSTALL_VER="$(printf '%s' "$INSTALL_SH" | grep -E '^VERSION=' | head -1 | cut -d'"' -f2)"
if [[ "$PKG_VER" != "$INSTALL_VER" ]]; then
  echo "→ Syncing install.sh VERSION (${INSTALL_VER} → ${PKG_VER}) on ${BRANCH}"
  TMP="$(mktemp)"
  printf '%s' "$INSTALL_SH" | sed "s/^VERSION=\"${INSTALL_VER}\"/VERSION=\"${PKG_VER}\"/" > "$TMP"
  SHA="$(gh api "repos/${REPO}/contents/scripts/install.sh?ref=${BRANCH}" --jq '.sha')"
  gh api -X PUT "repos/${REPO}/contents/scripts/install.sh" \
    -f message="chore: sync install.sh version with ${PKG_VER} release" \
    -f content="$(base64 < "$TMP" | tr -d '\n')" \
    -f sha="$SHA" \
    -f branch="$BRANCH" >/dev/null
  rm -f "$TMP"
fi

if gh pr list --repo "${REPO}" --head "${BRANCH}" --state open --json number -q 'length' | grep -q '^0$'; then
  echo ""
  echo "→ Open the release PR manually:"
  echo "  gh pr create --repo ${REPO} --head ${BRANCH} --base main \\"
  echo "    --title 'chore(main): release X.Y.Z' --body-file CHANGELOG.md"
fi
