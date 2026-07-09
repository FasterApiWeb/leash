#!/usr/bin/env bash
set -euo pipefail

# Generates docs/assets/demo.gif using VHS (https://github.com/charmbracelet/vhs)
# Requires: vhs, ttyd (installed automatically by vhs on first run)

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TAPE="$ROOT/docs/assets/demo.tape"
OUT="$ROOT/docs/assets/demo.gif"

if ! command -v vhs >/dev/null 2>&1; then
  echo "Install VHS first:"
  echo "  brew install vhs"
  echo "  # or: go install github.com/charmbracelet/vhs@latest"
  exit 1
fi

cat > "$TAPE" <<'EOF'
Output docs/assets/demo.gif
Set FontSize 16
Set Width 920
Set Height 420
Set Theme "Catppuccin Mocha"
Set Padding 20

Type "leash-secrets scan tests/fixtures/has-secrets.py"
Enter
Sleep 1s

Type "# Agent tries to write a live Stripe key..."
Enter
Sleep 800ms

Type "stripe.api_key = \"sk_live_\" + \"51H7mKjG8z4x9vRnC3yT5qW2bA0xF6pL8dM1nO4kJ7sE9iU\""
Enter
Sleep 1.2s

Type ""
Enter
Sleep 500ms

Type "⛔ LEASH-SECRETS — SECRET DETECTED"
Enter
Type "Type: Stripe Live Secret Key"
Enter
Type "Fix: use STRIPE_SECRET_KEY env var"
Enter
Sleep 2s
EOF

cd "$ROOT"
vhs "$TAPE"
echo "Wrote $OUT"
