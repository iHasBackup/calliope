# Handoff: Wickermoor interactive map

## Overview
This is a **delta** on top of `design_handoff_party_card_hover/` and the earlier Crooked Moon packages. It adds:
1. **New page**: an interactive map of the Wickermoor vale at `/map`. It is public, with a fog of war, a party location, the route so far, and place details.
2. **Campaign Home → Activities**: a new "Map of Wickermoor" card.
3. **Admin → new Map section**: edit pins, statuses, the party location, the route and place details.
4. **Content schema**: a new `map` object.
5. **Admin bug fix**: a stray closing `</div>` in the Schedule section broke the layout of every later section. It is removed.

## About the design files
The files in `reference/` are **HTML design prototypes**, not production code. Recreate them in the existing codebase with its own components and patterns. Read the `.dc.html` files for values and behaviour; don't port their runtime.

## Fidelity
High-fidelity. Modernist system: Archivo, zero radius, 2px rules, accent `#ec3013` (`--color-accent`), ground `#f3f2f2` (`--color-bg`), ink `#201e1d` (`--color-text`). Pages run inverted, with an ink background and ground text.
- Panel fill: `color-mix(in srgb, var(--color-bg) 7%, var(--color-text))`
- Muted text: `color-mix(in srgb, var(--color-bg) 60–70%, transparent)`
- Icons are Lucide, with square caps and joins.

## Assets
- `assets/wickermoor-map.png`: the map art, 1561×1008. Every map layer uses this aspect ratio (`aspect-ratio: 1561 / 1008`). Pin coordinates are **percentages of the image**, so they don't depend on the rendered size.

---

## 1. Map page (`reference/Map.dc.html`)

### Layout (max-width 1440px, page padding `clamp(10px, 4vw, 48px)`)
1. **Sticky top bar** (56px, 1px bottom hairline, 92% ink with `blur(8px)`). Left: a 12px red diamond and "THE CROOKED MOON" (800, uppercase, 0.08em). Right: "← Activities" (600, 13px, uppercase), linking to `Campaign Home#activities`.
2. **Title**: the kicker "MAP" (11px, 700, 0.16em, `--color-accent-400`), then the H1 "WICKERMOOR" (Archivo 800, `clamp(40px, 8vw, 88px)`, line-height 0.9, -0.035em).
3. **Body grid**: `minmax(0,1fr) 360px` at 1024px and wider, otherwise one column. 24px gap.

### Map stack (bottom to top, all `position:absolute; inset:0` inside a `position:relative` box with the 1561/1008 aspect ratio and `overflow:hidden`)
1. **Base image**: `filter: grayscale(1) contrast(1.05)`. The map prints in black and white, per the system rule.
2. **Party colour layer**: the same image in full colour, `clip-path: circle(9% at <party.x>% <party.y>%)`. It is always on, so the party's current location always shows in colour.
3. **Spotlight colour layer**: the same image in full colour, `clip-path: circle(R at x% y%)`, for the hovered or selected place.
   - **Grow animation**: when a new place becomes active, snap to `circle(0% at <new place>)` with no transition. Two animation frames later, set `circle(11% at <new place>)` with the transition `clip-path 520ms cubic-bezier(0.2,0.7,0.2,1)`. On leave it shrinks back to 0% with the same transition.
   - The active place is the hovered one, otherwise the selected one. If you hover another pin while a place is selected and then leave, the circle **re-grows at the selected place**.
   - Keyboard focus on a pin counts as hover.
4. **Fog of war**: `background: color-mix(in srgb, var(--color-text) 80%, transparent); backdrop-filter: blur(3px)`, plus a mask that cuts soft holes around discovered places:
   - One `radial-gradient(ellipse W% H% at x% y%, transparent 45%, #000 100%)` per place that is visited or heard of (plus the party's place if it is hidden).
   - Visited and party places: `10% 15.5%`. Heard of: `6.5% 10%`. These are roughly circles on the image's aspect ratio.
   - Combine the layers with `mask-composite: intersect` (and `-webkit-mask-composite: source-in`), so the fog only shows outside every hole. With no holes, use `mask-image: none` and the fog covers everything.
   - `pointer-events: none`.
5. **Route** (only when there are 2 or more visible stops): an SVG with `viewBox="0 0 100 100" preserveAspectRatio="none"`, so the points are image percentages.
   - Underlay polyline: ink, 7px, 55% opacity.
   - Top polyline: `--color-accent`, 3px, `stroke-dasharray: 10 8`, with `vector-effect: non-scaling-stroke`. Marching-ants animation: `stroke-dashoffset 0 → -36`, 1.6s linear, infinite.
   - Stops at hidden places are skipped.
6. **Place pins**, one per visited or heard-of place, except the party's place:
   - Hit area: a 44×44 button centred on (x%, y%).
   - Marker:
     - **Visited**: 18px red square with a 2px white border.
     - **Heard of**: 14px ground square with a 2px ink border.
     - Both have `box-shadow: var(--shadow-md)`.
   - Hovered or active: marker `scale(1.35)`, 220ms with the enter easing. Selected adds `outline: 2px solid #fff; outline-offset: 3px` and `aria-pressed="true"`.
   - **Name tip**: an ink chip with ground text (Archivo 700, 11px, uppercase, 0.08em, padding 5px 8px) sitting above the pin. Hidden by default with opacity 0 and translateY(4px); shown at opacity 1 and translateY(-2px).
   - Aria-label: "<name>, visited" or "<name>, heard of".
7. **Party marker**: a 56×56 hit area.
   - A 36px red square with a 2px white border, `--shadow-lg`, and a white Lucide `users` icon (18px).
   - Pulse ring: a 2px red square outline animating `scale 1 → 1.9` and `opacity 0.9 → 0` over 2s ease-out, infinite.
   - A red "PARTY" tag sits above it and is always visible.
   - Hover: `scale(1.12)`. Aria-label: "The party is at <name>".

Clicking the map background clears the selection.

**Legend** (under the map, 13px muted, wrapping with an 8px/20px gap):
- Visited: a red square with a white border.
- Heard of: a ground square with an ink border.
- Route so far: a red dashed line.
- Unexplored: a dark square.

**Mobile, below 760px**: the map sits in an `overflow-x: auto` container with an inner min-width of 760px. On load it scrolls horizontally to centre the party. The note "Scroll sideways to see the whole vale." appears under the legend.

### Side panel
- **At 1024px and wider**: the panel is `position: sticky; top: 72px`, with the panel fill and 20px padding. Max height is `calc(100vh - 96px)` and it scrolls.
- **Below 1024px**:
  - With nothing selected, the panel content flows below the map.
  - With a place selected, it becomes a **bottom sheet**: `position: fixed; left: 0; right: 0; bottom: 0`, max-height 64vh, ink background, 2px red top border, `--shadow-lg`, z-index 40. It enters with `translateY(24px) → 0` and `opacity 0 → 1` over 260ms with the enter easing.

**Overview (nothing selected)**
- **"The party is at"** button: red fill with white text, padding 16px.
  - Kicker: 11px, weight 500, uppercase.
  - Place name: 800, 22px, uppercase.
  - A right arrow.
  - Hover `--color-accent-600`. Click selects the party's place, and hover lights its spotlight.
- **Groups**: "Visited · N", then "Heard of · N". Each has an 11px uppercase label and a 2px rule.
  - Rows: min-height 48px, a 12px status square, the name (15px, 500) and a muted arrow, with 1px dividers.
  - Hovering or focusing a row lights that place on the map. Clicking selects it.
  - Hidden places are never listed.

**Place detail (a place selected)**
- **Tags**: the status tag "Visited" (red fill) or "Heard of" (outline at 45% ground). "Party is here" (ground fill, ink text) is added when it applies. A 44×44 × close button.
- **Name**: H2, Archivo 800, `clamp(28px, 3vw, 36px)`, uppercase, `text-wrap: balance`.
- **Description**: 15px, line-height 1.55, 85% ground.
- **Notable NPCs** (if any): a 2px rule, then the label, then rows with the name (700, 15px) and role (13px muted). Each source line is split on " — ", " – " or " - ".
- **Rumors & hooks** (if any): a 2px rule, the label in `--color-accent-400`, then rows with a 8px red outlined diamond and text at 15px.
- If there is nothing at all: "Nothing recorded here yet."
- **Esc** clears the selection.

### Loading skeleton (project rule)
- Shows until the content has loaded.
- Ink-tint blocks (`color-mix(in srgb, var(--color-bg) 7%, var(--color-text))`), zero radius: a map-shaped block at 1561/1008 plus a legend bar, and a panel column with an 88px block and three 44px rows.
- Opacity pulse 1 → 0.45 → 1 over 1.4s ease-in-out, infinite. No motion under `prefers-reduced-motion`.
- `aria-busy="true"`, `aria-label="Loading map"`.
- A `showSkeleton` preview prop forces it on.

### Reduced motion
Under `@media (prefers-reduced-motion: reduce)`, all `[data-anim]` animations and transitions are off: the spotlight grow, pin scale, tips, route march, pulse and sheet. State still changes, instantly.

---

## 2. Campaign Home → Activities card
This is a new card next to the crossword, in the same shell (panel fill, 20px body padding, 12px gap).
- **Thumbnail**: 16/9, in a `.grayscale` wrapper, the map image with `object-fit: cover; object-position: 60% 50%`.
- **Tags**: "LIVE" (red) and "EXPLORE · MAP" (11px, `--color-accent-400`).
- **Title**: "MAP OF WICKERMOOR" (800, 24px).
- **Copy**: "Where the party has been, what they have heard of, and where they stand tonight."
- **Stats**: "Party at <place name>" and "Discovered <N places>" (visited plus heard of).
- **Button**: "Open map" (`.btn-primary`, 48px) linking to the map page.

## 3. Admin → Map section (`reference/CampaignAdmin.dc.html`)
- **Nav**: a new item "Map" after Quest log, with the count "discovered/total" (for example "11/15").
- **Header**: "MAP" with "Pins, fog of war and the party's route on the public map. Hidden places stay under the fog until you reveal them." and a "View map →" outline link.
- **DM view panel**:
  - Shows the **full-colour** map, with the players' fog as a 55% ink shade using the same mask and the dashed route.
  - Pins are 28px hit areas: visited red, heard of ground, hidden as a translucent dashed outline. The party's pin is 20px red with a red outline.
  - Clicking a pin expands that place's row. Pin title attributes show the names.
- **Move pin**: click the pin icon on a place row, or add a new place. A red bar appears: "Click the map to place <name>" with a **Done** button, and the cursor becomes a crosshair. Clicking the map sets x and y to one decimal place.
- **Party & route panel**:
  - "The party is at" select, listing every place with "(hidden)" after hidden ones.
  - **Route so far**: rows of a stop number (01, 02…), a place select, ↑, ↓ and ×, each 44×44. "+ Add stop" adds the party's current location.
  - Note: "Drawn in this order. Stops at hidden places are skipped on the public map."
- **Places panel**: "Places · N" with "+ Add place". Rows have:
  - A status square (hidden is dashed).
  - A name input.
  - A 3-way segment: Hidden / Heard of / Visited, with the active option in red.
  - A Move pin icon button (Lucide `map-pin`).
  - An expand chevron that rotates 180° over 200ms.
  - **Expanded**: Description (textarea), Notable NPCs (textarea, placeholder "One per line: Name — role"), Rumors & hooks (textarea, "One per line"), the read-out "Pin at x … · y …", and "Remove place". Removing confirms first, also removes the place from the route, and clears `partyAt` if it pointed there.
- All map edits use the top **Save** button, like the other content.

## 4. Content schema (`reference/campaign-content.js`)
```js
map: {
  version: 2,                        // bump to reset stored maps to new defaults
  image: 'assets/wickermoor-map.png',
  partyAt: 'foxwallow',              // place id
  path: ['wickermoor-village', 'crooked-house', 'wickermoor-village', 'foxwallow'],
  places: [
    { id, name, x /* % of width */, y /* % of height */,
      status: 'hidden' | 'known' | 'visited',   // UI labels: Hidden / Heard of / Visited
      desc, npcs /* newline-separated "Name — role" */, rumors /* newline-separated */ }
  ]
}
```
- **Seed data**: 15 places. The descriptions and names come from the DM: Wickermoor Village, Druskenvald Estate (the Crooked House), Foxwillow Farmland, Dawn's Gate and the Howlers, The Crimson Monastery, The Drowned Crossroads, Moonsong Lake and the Isle of Mourn, Hartsblight Forest, Maidenmist Cemetery, Skitterdeep Mine, The Wytchwood and Silverbell River.
- **Hidden placeholders**: Wickermoor Hollow, The Bloody Brook and Mausoleum. Their descriptions are placeholder text.
- **Pin positions**: placed by eye against the art. The Wytchwood pin is a guess.
- **Privacy**: the public map must **never** receive hidden places. Filter them server-side, not just in the UI.

## Backend
- `GET /api/campaigns/:id/map` returns the public map, with hidden places removed and their route stops dropped.
- `GET /api/campaigns/:id/map?view=dm` (authenticated) returns everything.
- `PUT /api/campaigns/:id/map` saves from Admin.

## Files
- `reference/Map.dc.html`: the map page.
- `reference/CampaignAdmin.dc.html`: `mapVals()` and `mapUpd()` in the logic, and the `isMap` section in the template.
- `reference/Campaign Home v2.dc.html`: the Activities card, and `mapPartyAt` / `mapDiscovered`.
- `reference/campaign-content.js`: the `map` defaults and the version reset in `load()`.
- `assets/wickermoor-map.png`: the map art.
