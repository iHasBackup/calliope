#!/usr/bin/env bash
# Copy a Claude Design handoff bundle into design/.
# Files in the bundle overwrite their copies; nothing else is deleted, since a
# handoff can hold only the pages that changed. A changes-only bundle
# keeps its README as design/CHANGES-<date or name>.md instead of
# overwriting the main spec.
# Usage: npm run design:import [-- path/to/bundle.zip]
# Default: newest ~/Downloads/DnD*.zip (covers browser renames like "DnD (1).zip").
set -euo pipefail
shopt -s nocaseglob nullglob

repo="$(cd "$(dirname "$0")/.." && pwd)"
dest="$repo/design"

zip="${1:-}"
if [ -z "$zip" ]; then
  candidates=("$HOME"/Downloads/DnD*.zip)
  if [ ${#candidates[@]} -gt 0 ]; then
    zip="$(ls -t "${candidates[@]}" | head -1)"
  fi
fi
if [ -z "$zip" ] || [ ! -f "$zip" ]; then
  echo "No handoff zip found. Expected ~/Downloads/DnD.zip or a path argument." >&2
  exit 1
fi
echo "Importing $zip"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
unzip -q "$zip" -d "$tmp"
rm -rf "$tmp/__MACOSX"
find "$tmp" -name .DS_Store -delete

# Unwrap a single top-level folder so files land directly in design/.
src="$tmp"
entries=("$tmp"/*)
if [ ${#entries[@]} -eq 1 ] && [ -d "${entries[0]}" ]; then
  src="${entries[0]}"
fi

# A delta bundle (folder named *changes*, or a README that calls itself a
# delta) keeps its README beside the main spec instead of replacing it.
bundle="$(basename "$src")"
if [ -f "$src/README.md" ] && { [[ "$bundle" == *changes* ]] || head -20 "$src/README.md" | grep -qi 'delta'; }; then
  stamp="$(echo "$bundle" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' || true)"
  [ -z "$stamp" ] && stamp="$(echo "$bundle" | sed -E 's/^design_handoff_//; s/_/-/g')"
  mv "$src/README.md" "$src/CHANGES-$stamp.md"
  echo "Delta handoff: README saved as design/CHANGES-$stamp.md"
fi

if [ -z "$(ls -A "$src")" ]; then
  echo "Zip is empty; design/ left untouched." >&2
  exit 1
fi

mkdir -p "$dest"
cp -R "$src"/. "$dest"/

echo "design/ updated. Changes:"
git -C "$repo" status --short -- design
