# Handoff: Wickermoor map, sessions per place

## Overview
This is a **delta** on top of `design_handoff_wickermoor_map/` and `design_handoff_map_zoom/`. It links session recaps to map places through the recap **tags** field, which the DM fills with location names.
- **Click or select a place** (pin, panel list row or "The party is at" button): the place detail panel shows a new **"Sessions here · N"** section listing every session tagged with that place.
- Each row shows the **session number and title only**. No body, date or other tags.
- Places with no matching sessions don't show the section.

Nothing else changes: zoom, spotlight, fog, route and the overview panel stay as they are.

## About the design files
`reference/Map Section.dc.html` is an **HTML design prototype**, not production code. Recreate the behaviour inside the existing map component. Read it for values and logic; don't port its runtime.

## Fidelity
High-fidelity. Modernist system, unchanged (Archivo, zero radius, 2px rules, inverted ink page, accent `--color-accent`).

## Data
No schema change. It uses the existing fields:
- `recaps[]`: `{ id, title, date, nights, body, tags }`. `tags` is a **comma-separated string** (e.g. `"Wickermoor Village, Crooked House"`).
- `map.places[]`: `{ id, name, x, y, status, desc, npcs, rumors }`.

### Session numbering
It must match the Recaps page: sort recaps by `date` ascending (string compare on `YYYY-MM-DD`), and number them from 1 in that order, zero-padded to 2 digits (`01`, `02`, …). List order in the panel is the same, oldest first.

### Tag → place matching
Each tag is split on `,`, trimmed, then compared to a set of **keys** for the place. A tag matches if it equals a key, or one is a **whole-word substring** of the other and the shorter side is at least **4 characters**.

**Normalise** (applied to tags and keys):
1. Lowercase, strip diacritics (NFKD then drop combining marks).
2. Remove apostrophes (straight and curly `’`).
3. Replace every run of non-alphanumerics with a single space and trim.
4. Drop a leading `the `.

**Keys for a place:**
- the full name
- the name with any `(…)` removed
- each `(…)` part on its own
- each side of the name split on ` and ` / ` & `
- the `id` with `-` replaced by spaces

Examples against the seed data:
| Tag | Matches |
| --- | --- |
| `Crooked House` | Druskenvald Estate (the Crooked House) |
| `Druskenvald Estate` | Druskenvald Estate (the Crooked House) |
| `Wickermoor Village`, `wickermoor village` | Wickermoor Village |
| `Isle of Mourn` | Moonsong Lake and the Isle of Mourn |
| `Dawn's Gate` | Dawn’s Gate and the Howlers |
| `Barrow`, `Hollowmere` | nothing (not a place) |

Known looseness: a broad tag like `Wickermoor` matches every place containing that word (Wickermoor Village, Wickermoor Hollow). That is acceptable for now. If it becomes a problem, the follow-up is a place picker in Admin that stores place **ids** on the recap instead of free text.

**Production recommendation:** do this matching once, server-side or in a selector, and pass `sessions: [{ no, title }]` per place to the component.

### Privacy
- Hidden places are never shown, so their sessions are never shown either. Keep the existing server-side filter.
- **Heard of** places show the section too if a session is tagged with them. This exposes only session titles, which players can already read on the Recaps page.

## Panel UI
The section sits in the place detail panel **after the name and description, before Notable NPCs**.

- **Container**: `padding-top: 14px; border-top: 2px solid color-mix(in srgb, var(--color-bg) 14%, transparent)`. It follows the same pattern as the NPCs and Rumors blocks.
- **Label**: "SESSIONS HERE · N", 11px, 700, `letter-spacing: 0.14em`, uppercase, `--color-accent-400`, 6px bottom padding.
- **Row**: a grid `40px minmax(0,1fr)`, 10px gap, `align-items: baseline`, `padding: 10px 0`, bottom border `1px solid color-mix(in srgb, var(--color-bg) 10%, transparent)`.
  - Number: `S01`, Archivo 800, 12px, `letter-spacing: 0.1em`, `--color-accent-400`. This is the same treatment as the "SESSION 01" label on Recaps.
  - Title: Archivo 700, 15px, line-height 1.3, uppercase, `text-wrap: pretty`.
- Rows are **not interactive** in this version. Use plain elements, not buttons.

### Empty state
"Nothing recorded here yet." now shows only when there are **no sessions** and the existing empty conditions also hold.

## Responsive
No changes. On desktop (1024px and wider), the sticky panel grows with the extra rows. Below 1024px, the bottom sheet (max 64vh) scrolls inside as before.

## Files
- `reference/Map Section.dc.html`:
  - The helpers at the top of the script: `norm`, `hasWords`, `placeKeys`, `tagMatches`.
  - In `renderVals`, the `if (sp)` block: `sessions`, `hasSessions`, `sessionsLabel` and the updated `empty`.
  - In the template, the `d.hasSessions` block above `d.hasNpcs`.
