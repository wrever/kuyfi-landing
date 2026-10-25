#!/usr/bin/env bash
# Sync Astro docs build from sibling alex0tico/kuyfi (docs-site) into public/docs
# so kuyfi.vercel.app/docs is served by this landing deploy.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KUYFI_DOCS="${KUYFI_DOCS_SITE:-$ROOT/../kuyfi/docs-site}"
OUT="$ROOT/public/docs"

if [[ ! -f "$KUYFI_DOCS/package.json" ]]; then
  echo "error: docs-site not found at $KUYFI_DOCS" >&2
  echo "Clone alex0tico/kuyfi next to this repo, or set KUYFI_DOCS_SITE=/path/to/docs-site" >&2
  exit 1
fi

echo "→ building docs-site in $KUYFI_DOCS"
(cd "$KUYFI_DOCS" && npm run build)

echo "→ copying to $OUT"
rm -rf "$OUT"
mkdir -p "$OUT"
rsync -a "$KUYFI_DOCS/dist/" "$OUT/"

echo "✓ public/docs ready ($(du -sh "$OUT" | awk '{print $1}'))"
echo "  Local check: npm run build && npm run preview → /docs/"
