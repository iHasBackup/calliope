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

# A delta bundle keeps its README beside the main spec instead of replacing
# it. It is a delta when its title differs from the main spec's title, when
# the folder is named *changes*, or when the README calls itself a delta.
bundle="$(basename "$src")"
if [ -f "$src/README.md" ]; then
  main_title="$( [ -f "$dest/README.md" ] && head -1 "$dest/README.md" || true )"
  new_title="$(head -1 "$src/README.md")"
  if [[ "$bundle" == *changes* ]] || head -20 "$src/README.md" | grep -qi 'delta' || { [ -n "$main_title" ] && [ "$new_title" != "$main_title" ]; }; then
    stamp="$(echo "$bundle" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' || true)"
    [ -z "$stamp" ] && stamp="$(echo "$bundle" | sed -E 's/^design_handoff_//; s/_/-/g')"
    name="CHANGES-$stamp.md"
    n=2
    while [ -f "$dest/$name" ] && ! cmp -s "$dest/$name" "$src/README.md"; do name="CHANGES-$stamp-$n.md"; n=$((n + 1)); done
    mv "$src/README.md" "$src/$name"
    echo "Delta handoff: README saved as design/$name"
  fi
fi

if [ -z "$(ls -A "$src")" ]; then
  echo "Zip is empty; design/ left untouched." >&2
  exit 1
fi

mkdir -p "$dest"
cp -R "$src"/. "$dest"/

echo "design/ updated. Changes:"
git -C "$repo" status --short -- design
