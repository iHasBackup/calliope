# Handoff: Admin schedule history pagination

## Overview
This is a **delta** on top of `design_handoff_changes_2026-10-25/`. The only change is pagination in Admin → Schedule → History. Everything else is unchanged.

## About the design files
`reference/CampaignAdmin.dc.html` is an **HTML design prototype**, not production code. Recreate the behaviour in the existing codebase using its own components and patterns.

## Fidelity
High-fidelity. Modernist system: Archivo, zero radius, accent `#ec3013` (`--color-accent`), ground `#f3f2f2` (`--color-bg`), ink `#201e1d` (`--color-text`). The admin runs inverted: background is ink, text is ground.

## What changed
**History list, 5 rows per page**
- Rows are still newest first, max 100 stored. Only 5 rows show at a time.
- When there are **5 or fewer** rows, no pager is shown.
- When there are **more than 5**, a pager sits below the list: a flex row with space-between, 12px gap, wrapping.
  - **Left**: range text "1–5 of 12". 13px, muted (`color-mix(in srgb, var(--color-bg) 60%, transparent)`), tabular numbers.
  - **Right**: previous arrow, numbered page buttons, next arrow, with 2px gaps.
    - Each button is min 40×40, padding 0 10px, Archivo 600 13px, with a 1px border at `color-mix(in srgb, var(--color-bg) 30%, transparent)` and zero radius.
    - The current page has a red fill, red border and white text, plus `aria-current="page"`.
    - Hover: border `--color-accent-400`.
    - The arrows are `disabled` and at 45% opacity on the first and last page. Their aria-labels are "Previous page" and "Next page".

## Behaviour
- State: `histPage` (0-based), clamped to the available pages so it never points past the end.
- Submitting a schedule change (Cancel, Move or Extra) or clicking **Undo** resets to page 1, so the new row is visible.
- Undo buttons keep acting on the right entry on any page.

## Backend
`GET /api/campaigns/:id/schedule/history?page=1&pageSize=5` returns `{ items, total }`. Order by `at` descending.

## Files
- `reference/CampaignAdmin.dc.html`: see the History panel in the Schedule section, and `histPage` / `histPages` in the logic.
