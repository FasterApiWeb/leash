#!/usr/bin/env bash
set -euo pipefail

# Record a real terminal session (install + usage) and convert to GIF.
# Requires: asciinema, agg (brew install asciinema agg)
#
# Output: docs/assets/demo.cast (recording) + docs/assets/demo.gif

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CAST="$ROOT/docs/assets/demo.cast"
GIF="$ROOT/docs/assets/demo.gif"

for cmd in asciinema agg; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing $cmd. Install with:"
    echo "  brew install asciinema agg"
    exit 1
  fi
done

chmod +x "$ROOT/scripts/demo-session.sh"

echo "Recording live install + usage session..."
cd "$ROOT"
ASC_CI=1 asciinema rec "$CAST" \
  --overwrite \
  --title "leash-secrets install and scan" \
  --command "bash scripts/demo-session.sh"

echo "Converting cast to GIF..."
agg --fps-cap 15 --font-size 15 --theme monokai --cols 100 "$CAST" "$GIF"

echo "Wrote $GIF ($(du -h "$GIF" | cut -f1))"
echo "Source recording: $CAST (gitignored)"
