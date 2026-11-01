# Handoff: Campaign Home section title sizes

## Overview
This is a **delta** on top of `design_handoff_map_zoom/` and the earlier Campaign Home packages. The three section headings on Campaign Home now share **one type style**. Before this they used two different sizes.
- **Recaps**: "Session recaps"
- **Map**: "Wickermoor Hollow"
- **Activities**: "Activities"

Nothing else changes. The kickers above each heading ("N sessions · N nights", "Detail map of", "Between sessions") are unchanged.

## About the design files
`reference/Campaign Home v2.dc.html` is an **HTML design prototype**, not production code. Apply the style to the existing heading component, or make it a shared "section title" style.

## Fidelity
High-fidelity. Modernist system: Archivo 800 (set by the stylesheet's `h1` rule), zero radius, ground text on an ink background.

## Section title style
```css
.section-title {
  margin: 0;
  font-size: clamp(36px, 6vw, 72px);
  line-height: 0.92;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  text-wrap: balance;
}
```
- **36px** below about 600px wide. **72px** at 1200px and wider. Fluid in between.
- `text-wrap: balance` splits two-line titles evenly. On a phone, "Wickermoor Hollow" becomes two even lines, and "Session recaps" stays on one line.

## Type hierarchy (for reference)
| Level | Where | Size |
| --- | --- | --- |
| Display | The arc title on the Campaign view, the largest on the site | `clamp(38px, 8vw, 104px)`, unchanged |
| **Section title** | Recaps, Map, Activities | **`clamp(36px, 6vw, 72px)`** |
| Panel or card title | For example the map place name, H2 | `clamp(28px, 3vw, 36px)`, unchanged |

The section title is one clear step below the display title, so the arc title stays the main moment of the site.

## Before → after
- Recaps and Activities: `clamp(40px, 7vw, 88px)`, line-height 0.9, -0.035em **→** the section title style.
- Map: `clamp(32px, 5.5vw, 60px)`, line-height 0.95, -0.03em **→** the section title style.

## Files
- `reference/Campaign Home v2.dc.html`: the three `<h1>` elements in the `isRecaps`, `isMap` and `isActivities` views.
