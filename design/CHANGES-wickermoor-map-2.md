# Handoff: Wickermoor map (Campaign Home → Map)

This package **replaces** the earlier version of `design_handoff_wickermoor_map/`. The map is no longer a standalone page or an Activities card. It is now a **section of Campaign Home**, reached by a "Map" nav tab at `#map`.

## Overview
1. **Campaign Home**:
   - A new **Map** tab sits between Recaps and Activities. The URL hash is `#map`.
   - The tab indicator slides as it does for the other tabs.
   - The section heading has the kicker "Detail map of" and the H1 "Wickermoor Hollow".
2. **Map section**: an interactive illustrated map with a drifting fog of war, the party's location, the route so far, a colour spotlight, and a details panel.
3. **Admin → Map**: edit pins, statuses, the party location, the route and place details.
4. **Content schema**: a new `map` object.
5. **Admin bug fix**: a stray `</div>` in Schedule broke the layout of every later section. It is removed.

## About the design files
The files in `reference/` are **HTML design prototypes**, not production code. Recreate them in the existing codebase with its own components and patterns. Read the `.dc.html` files for values and behaviour; don't port their runtime. `Map Section.dc.html` is imported by Campaign Home and is not a page on its own. In production, build it as a component rendered inside the Campaign Home layout.

## Fidelity
High-fidelity. Modernist system: Archivo, zero radius, 2px rules, accent `#ec3013` (`--color-accent`), ground `#f3f2f2` (`--color-bg`), ink `#201e1d` (`--color-text`). The page is inverted, with an ink background and ground text.
- Panel fill: `color-mix(in srgb, var(--color-bg) 7%, var(--color-text))`
- Muted text: `color-mix(in srgb, var(--color-bg) 60–70%, transparent)`
- Icons are Lucide, with square caps and joins.
- **Enter easing**: `cubic-bezier(0.2,0.7,0.2,1)`. **Move easing**: `cubic-bezier(0.65,0,0.25,1)`.

## Assets
- `assets/wickermoor-map.png`: 1561×1008, about 3.6 MB. **Ship a compressed WebP or AVIF in production**, with a responsive `srcset`.
- Every map layer uses `aspect-ratio: 1561 / 1008`. Pin coordinates are **percentages of the image**.

---

## 1. Campaign Home changes
- **Tabs**: `[['home','Campaign'], ['recaps','Recaps'], ['map','Map'], ['activities','Activities']]`. The mobile menu uses the same list.
- **Hash routing**: `#map` opens the section on load. The initial view is read from `location.hash` **before the first render**, so the page never flashes the home view first. `go('map')` updates the hash with `history.replaceState` and scrolls to the top, the same as the other views.
- **Section wrapper**: it enters with the standard `cm-view-in` animation (360ms, enter easing). Top padding is `clamp(36px,6vw,72px)`, with a 28px gap.
  - Kicker: "DETAIL MAP OF", 11px, 700, 0.16em, `--color-accent-400`.
  - H1: "WICKERMOOR HOLLOW", `clamp(32px, 5.5vw, 60px)`, line-height 0.95, -0.03em, uppercase.
  - Horizontal padding is `clamp(16px,4vw,48px)`, matching the map grid below.
- **The Activities map card is removed.**

## 2. Map section (`reference/Map Section.dc.html`)

### Grid
`minmax(0,1fr) 360px` at 1024px and wider, otherwise one column. 24px gap, padding `0 clamp(16px,4vw,48px) 64px`.

### Map stack
All layers are `position:absolute; inset:0` inside a `position:relative; overflow:hidden` box with the 1561/1008 aspect ratio. From bottom to top:
1. **Base image**: `filter: grayscale(1) contrast(1.05)`.
2. **Party colour layer**: the same image, `clip-path: circle(9% at <party>)`. Always on.
3. **Spotlight colour layer**: the same image, `clip-path: circle(R at x% y%)`.
   - **Grow**: when a place becomes active (hover, focus or select), snap to `circle(0%)` at that place with no transition. Two animation frames later, set `circle(11%)` with `clip-path 520ms` enter easing. On leave it shrinks to 0%.
   - The active place is the hovered one, otherwise the selected one. Leaving a hovered pin while another place is selected **re-grows at the selected place**.
4. **Fog of war**: `background: color-mix(in srgb, var(--color-text) 74%, transparent); backdrop-filter: blur(3px)`.
   - Mask: one `radial-gradient(ellipse W% H% at x% y%, transparent 45%, #000 100%)` per visible place (plus the party's place if it is hidden). Visited and party: `10% 15.5%`. Heard of: `6.5% 10%`.
   - Combine with `mask-composite: intersect` (and `-webkit-mask-composite: source-in`). With no holes, use `mask-image: none`.
   - **Drifting mist**: two child layers at `inset: -20%`, each with four soft `radial-gradient` blobs of the ground colour at 32–38%, fading to transparent at 70%.
     - Layer A: `blur(18px)`, `translate3d(0,0) → (-14%, 6%)`, 22s ease-in-out, infinite, alternate.
     - Layer B: `blur(22px)`, `(0,0) → (12%, -7%)`, 30s.
     - The parent's mask clips them, so the mist only shows inside the fog.
5. **Route** (2 or more visible stops): an SVG with `viewBox="0 0 100 100" preserveAspectRatio="none"`.
   - Underlay: ink, 7px, 55% opacity.
   - Top: red, 3px, `dasharray 10 8`, `vector-effect: non-scaling-stroke`, with a marching `dashoffset 0 → -36` over 1.6s linear, infinite.
   - Hidden stops are skipped.
6. **Edge vignette**: `box-shadow: inset 0 0 clamp(40px,6vw,90px) clamp(16px,3vw,44px) var(--color-text)`, `z-index: 1`, `pointer-events: none`. It blends the map into the page. There is no border on the map.
7. **Place pins** (`z-index` 2 or more), for visited and heard-of places except the party's:
   - Hit area: a 44×44 button.
   - **Visited**: an 18px red square with a 2px white border. **Heard of**: a 14px ground square with a 2px ink border. Both have `--shadow-md`.
   - Active: `scale(1.35)`, 220ms. Selected: `outline 2px #fff, offset 3px` and `aria-pressed`.
   - Name tip: an ink chip (700, 11px, uppercase), fading in and moving 4px → -2px.
8. **Party marker**: a 56×56 hit area.
   - A 36px red square with a 2px white border, `--shadow-lg`, and a Lucide `users` icon.
   - A pulse ring at `scale 1 → 1.9` and `opacity 0.9 → 0` over 2s.
   - A red "PARTY" tag above it, always shown.
9. **Image loader** (`z-index: 20`): shows until the map image has loaded.
   - Panel fill with the skeleton pulse.
   - At the bottom left: "UNFOLDING THE MAP" (11px, 700, 0.16em, muted), and a 3px track (280px max) with a 40% red bar sweeping `translateX(-100% → 250%)` over 1.2s, infinite.
   - It fades out over 500ms after a 120ms delay, then sets `pointer-events: none` and `aria-hidden`.
   - Detect the load with a `load` / `error` listener, and check `img.complete` for cached images. **Don't use an inline `onload` attribute.**

Clicking the map background clears the selection, and **Esc** does the same.

**Legend** (13px muted): Visited, Heard of, Route so far, Unexplored.

**Below 760px**: the map scrolls horizontally inside `overflow-x:auto`, with a min-width of 760px, and centres on the party when it loads. The note "Scroll sideways to see the whole vale." is shown.

### Panel
- **At 1024px and wider**: `position: sticky; top: 72px`, with the panel fill and 20px padding. **There is no internal scroll and no max-height**; the panel grows with its content.
- **Below 1024px**: with nothing selected, it flows below the map. With a place selected, it becomes a **bottom sheet** (fixed to the bottom, max-height 64vh, scrolls inside), with a 2px red top border and `--shadow-lg`. It enters over 260ms.

**Overview**
- **"The party is at <place>"**: a red button that selects the party's place.
- **Groups**: "Visited · N", then "Heard of · N". Rows are 48px tall. Hovering or focusing a row lights that place on the map.
- Hidden places are never listed.

**Place detail**, depending on status:
| Status | Shows |
| --- | --- |
| **Visited** | Status tag, "Party is here" (if it applies), name, **description**, **Notable NPCs**, **Rumors & hooks** |
| **Heard of** | Status tag, name, **Rumors & hooks only** (no description or NPCs) |
| Nothing to show | "Nothing recorded here yet." |

- **NPC lines**: "Name — role", split on " — ", " – " or " - ".
- **Rumors**: one per line, each with a red outlined diamond bullet.
- **Name**: H2, Archivo 800, `clamp(28px,3vw,36px)`, uppercase, `text-wrap: balance`.

### Reduced motion
Every `[data-anim]` animation and transition is off: spotlight grow, pins, tips, route march, pulse, fog drift, sheet and loader sweep. State still changes, instantly.

## 3. Loading skeletons (project rule)
All of them use ink-tint blocks (`color-mix(in srgb, var(--color-bg) 7%, var(--color-text))`), zero radius, an opacity pulse of 1 → 0.45 → 1 over 1.4s that stays still under `prefers-reduced-motion`, `aria-busy="true"`, and `aria-label="Loading map"`.
- **Page load at `#map`**: Campaign Home shows a **map-shaped** skeleton instead of the home skeleton. It has a kicker bar (140px × 12px), a title bar, a 1561/1008 map block with a legend bar, and a panel column (one 88px block and three 44px blocks).
- **Switching to the Map tab**: the same body skeleton shows until the map component reports ready. In the prototype that is the `onReady` prop, with the component kept hidden at `opacity 0` and positioned absolutely until then. It then fades in over 240ms. Switching away and back resets it.
- **Map image**: the in-map "Unfolding the map" loader above.
- A `showSkeleton` preview prop forces the skeleton on, on both Campaign Home and Map Section.

## 4. Admin → Map (`reference/CampaignAdmin.dc.html`)
- **Nav**: "Map", with the count "discovered/total".
- **Header**: "View map →" links to `Campaign Home#map`.
- **DM view**: the full-colour map, the players' fog as a 55% shade, the route, and every pin. Hidden pins have a dashed outline. Clicking a pin expands its row.
- **Move pin**: shows a red bar, "Click the map to place <name>", with a Done button and a crosshair cursor. Clicking the map sets x and y to one decimal place.
- **Party & route**:
  - A "The party is at" select.
  - Route rows: a number, a place select, ↑, ↓ and ×. "+ Add stop".
- **Places**:
  - Each row has a name input, a Hidden / Heard of / Visited segment, a Move pin button (Lucide `map-pin`) and an expand chevron.
  - Expanded: Description, Notable NPCs ("Name — role" per line), Rumors & hooks (one per line), the coordinates read-out, and Remove (with a confirm; it also cleans up the route and `partyAt`).
  - "+ Add place" adds a hidden place at 50/50 and starts move mode.
- All map edits use the top **Save** button.

## 5. Content schema (`reference/campaign-content.js`)
```js
map: {
  version: 2,                      // bump to reset stored maps to new defaults
  image: 'assets/wickermoor-map.png',
  partyAt: 'foxwallow',
  path: ['wickermoor-village', 'crooked-house', 'wickermoor-village', 'foxwallow'],
  places: [{ id, name, x, y, status: 'hidden'|'known'|'visited', desc, npcs, rumors }]
}
```
- **Seed data**: 15 places. The names and descriptions come from the DM.
- **Hidden placeholders**: Wickermoor Hollow, The Bloody Brook and Mausoleum.
- **Silverbell River**: its description is placeholder text.
- **Pin positions**: placed by eye. The Wytchwood pin is a guess.
- **Privacy**: players must never receive hidden places. For heard-of places, send only `rumors`, not `desc` or `npcs`. Filter both server-side.

## Backend
- `GET /api/campaigns/:id/map`: the public payload, filtered as above.
- `GET /api/campaigns/:id/map?view=dm` (authenticated): everything.
- `PUT /api/campaigns/:id/map`: saves from Admin.

## QA
The prototype was checked with no console errors on Campaign Home (`#map`, the tab switch and party select), Map Section and Campaign Admin.

## Files
- `reference/Campaign Home v2.dc.html`: the tabs, the `isMap` view, `isLoadingMap`, `mapSkel` / `mapWrap` / `onMapReady`, and the hash init in `state`.
- `reference/Map Section.dc.html`: the map component.
- `reference/CampaignAdmin.dc.html`: `mapVals()` / `mapUpd()` and the `isMap` section.
- `reference/campaign-content.js`: the `map` defaults and the version reset in `load()`.
- `assets/wickermoor-map.png`
