#!/usr/bin/env bash
# Apply docs must teach kanithanj.cv, not the leftover local writer.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOC="$ROOT/docs/apply-cv-from-packs.md"
fail() {
  echo "FAIL: $*" >&2
  exit 1
}

grep -q 'kanithanj.cv generate' "$DOC" || fail "apply-cv-from-packs.md must teach kanithanj.cv generate"

if awk '/```bash/{p=1; next} /```/{p=0} p' "$DOC" | grep -q 'pnpm generate-apply-cv'; then
  fail "bash examples must not teach pnpm generate-apply-cv"
fi

echo "OK apply-docs wave1"
