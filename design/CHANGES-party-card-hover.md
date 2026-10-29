# Handoff: Campaign Home, party card hover

## Overview
This is a **delta** on top of `design_handoff_campaign_home_game_system/` (Campaign Home v2). It adds a hover animation to each party card on the home view, including the "Seat open" card. Layout, copy and data are unchanged.

## About the design files
`reference/Campaign Home v2.dc.html` is an **HTML design prototype**, not production code. The prototype tracks hover in component state because it uses only inline styles. In production, use plain CSS (`.card:hover` and descendant selectors). No JS is needed.

## Fidelity
High-fidelity. Modernist system: Archivo, zero radius, accent `#ec3013` (`--color-accent`), ground `#f3f2f2` (`--color-bg`), ink `#201e1d` (`--color-text`). The page is inverted.

## Easing
- **Enter**: `cubic-bezier(0.2, 0.7, 0.2, 1)`, ease-out. It is used for all the movement below.
- Hovering out reverses with the same timings.

## Hover effect (all parts move together)
| Part | Rest | Hover | Transition |
| --- | --- | --- | --- |
| Card | `translateY(0)`, no shadow | `translateY(-6px)`, `box-shadow: var(--shadow-lg)` | transform 320ms enter, box-shadow 320ms enter |
| Card border (2px) | Member: transparent. Seat open: `color-mix(in srgb, var(--color-bg) 25%, transparent)` | `var(--color-accent)` | border-color 220ms ease |
| Portrait layer (the `.grayscale` wrapper, the image or slot) | `scale(1)` | `scale(1.06)` | transform 600ms enter. It is slower on purpose, for a gentle push-in. The card's `overflow: hidden` clips it. |
| Bottom accent bar (new) | `scaleX(0)` | `scaleX(1)` | transform 360ms enter |
| Text block (species, name, class, subclass) | `translateY(0)` | `translateY(-6px)` | transform 320ms enter |

**The new bottom accent bar**: `position: absolute; left: 0; bottom: 0; width: 100%; height: 4px; background: var(--color-accent); transform-origin: left; pointer-events: none; aria-hidden`. It sits above the gradient and below the text block. It grows from left to right.

The LV badge and the gradient overlay don't change.

## Accessibility
- Under `@media (prefers-reduced-motion: reduce)` all of these transitions are off. The border colour change still applies, instantly.
- The cards are not interactive, so there is no focus state. If cards later link to a character sheet, apply the same effect on `:focus-visible` as well, plus the system focus ring.
- On touch devices there's no hover, so cards render at rest. Wrap the effect in `@media (hover: hover)` so it doesn't stick after a tap.

## Suggested CSS
```css
.party-card { transition: transform 320ms var(--ease-enter), border-color 220ms ease, box-shadow 320ms var(--ease-enter); }
.party-card .portrait { transition: transform 600ms var(--ease-enter); }
.party-card .bar { transform: scaleX(0); transform-origin: left; transition: transform 360ms var(--ease-enter); }
.party-card .info { transition: transform 320ms var(--ease-enter); }
@media (hover: hover) {
  .party-card:hover { transform: translateY(-6px); border-color: var(--color-accent); box-shadow: var(--shadow-lg); }
  .party-card:hover .portrait { transform: scale(1.06); }
  .party-card:hover .bar { transform: scaleX(1); }
  .party-card:hover .info { transform: translateY(-6px); }
}
@media (prefers-reduced-motion: reduce) { .party-card, .party-card * { transition: none !important; } }
```

## Files
- `reference/Campaign Home v2.dc.html`: see the party grid in the home view, and the `party.forEach` block in `renderVals()` (`lift`, `zoom`, `bar`, `textLift`, `shadow`, `borderNow`).
