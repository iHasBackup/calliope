#!/usr/bin/env bash
# Replace design/ with a Claude Design handoff bundle.
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

if [ -z "$(ls -A "$src")" ]; then
  echo "Zip is empty; design/ left untouched." >&2
  exit 1
fi

rm -rf "$dest"
mkdir -p "$dest"
cp -R "$src"/. "$dest"/

echo "design/ updated. Changes:"
git -C "$repo" status --short -- design
