# Handoff: Campaign Home, Game system stat

## Overview
This is a **delta** on top of `design_handoff_campaign_home_motion/` (Campaign Home v2). On the home view, the **In-game night** stat card is replaced by a **Game system** card. Nothing else changes.

## About the design files
`reference/Campaign Home v2.dc.html` is an **HTML design prototype**, not production code. Recreate it in the existing codebase with its own components.

## Fidelity
High-fidelity. Modernist system: Archivo, zero radius, accent `#ec3013` (`--color-accent`), ground `#f3f2f2` (`--color-bg`), ink `#201e1d` (`--color-text`). The page is inverted: ink background, ground text.

## Data
- Source: the campaign-level `system` field, a free-text string set in Admin → Campaign → Game. Added in `design_handoff_changes_2026-10-25`.
- Fallback when empty: **"TBD"**.
- The `nights` field is no longer shown in this card. It is still used elsewhere: the "Nights 1–N" kicker in the story section and "N sessions · N nights" on Recaps.

## Game system card
It sits in the same stat row as Party level. The card shell is unchanged:
- Panel fill `color-mix(in srgb, var(--color-bg) 7%, var(--color-text))`, padding 18px 20px.
- Flex row, items centred, 16px gap, `min-width: 0`.
- **Flex: `2 1 240px`**, changed from `1 1 150px`. The text value needs more room than a two-digit number.

Contents:
- **Icon**: Lucide **gamepad-2**, 44×44, stroke `var(--color-accent)`, stroke-width 2, round caps and joins, `flex: none`, `aria-hidden`. It is the **same size as the Party level icon** (44px).
- **Text column**: flex column, 4px gap, `min-width: 0`.
  - Label: "GAME SYSTEM", 11px, weight 700, 0.14em tracking, uppercase, `color-mix(in srgb, var(--color-bg) 65%, transparent)`.
  - Value: for example "D&D 5E (2024)". Archivo 800, **20px**, line-height 1.15, uppercase, letter-spacing 0, `overflow-wrap: normal`, `text-wrap: balance`. It breaks only at spaces, never mid-word.

## Files
- `reference/Campaign Home v2.dc.html`: the stat card is in the home view, and `systemText` is in `renderVals()`.
- `reference/campaign-content.js`: includes the `system` default.
