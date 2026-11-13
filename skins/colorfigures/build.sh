#!/usr/bin/env bash
# Rebuild the self-contained hire-desk page from the source figure and the
# vendored Colorfigures engine.
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
src="$root/skins/colorfigures/hire-desk.html"
eng="$root/third_party/colorfigures/assets/core.js"
out="$root/public/skins/colorfigures/hire-desk.html"
cp "$eng" "$root/skins/colorfigures/core.js"
python3 "$root/third_party/colorfigures/scripts/build.py" "$src" "$out"
echo "wrote $out"
