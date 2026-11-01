# Handoff: Wickermoor map, marker zoom

## Overview
This is a **delta** on top of `design_handoff_wickermoor_map/`. It adds zoom to the map section on Campaign Home (`#map`). Nothing else changes.
- **Hover or focus a marker**: the map eases in to **1.22×**, centred on that marker.
- **Click or select a place**: the map zooms to **2.6×** on that place. This also applies when the place is picked from the panel list or the "The party is at" button.
- **× on the details panel, Esc, or a click on empty map**: the map returns to the full view (1×).

## About the design files
`reference/Map Section.dc.html` is an **HTML design prototype**, not production code. Recreate the behaviour inside the existing map component.

## Fidelity
High-fidelity. Modernist system, unchanged. Timing and easing below are exact.

## Structure
The map box (`position: relative; overflow: hidden`, 1561/1008) now has **two zoom wrappers** that get the **same transform**, with the edge vignette between them so it stays fixed at the frame edges:
1. **Layer wrapper** (`z-index: 0`, `pointer-events: none` except where layers need clicks): the base image, party colour layer, spotlight layer, fog plus drifting mist, and the route SVG.
2. **Edge vignette**: **not** zoomed, `z-index: 1`.
3. **Pin wrapper** (`z-index: 2`, `pointer-events: none`): the place pins and the party marker. Each pin button sets `pointer-events: auto`.
4. **Image loader**: not zoomed, `z-index: 20`.

## Transform (the important part)
Don't animate `transform-origin`; that is what made the first version shake. Keep `transform-origin: 0 0` and compute a translate that holds the target point fixed:
```js
// x, y = target place in % of the image; z = zoom level
transform = `translate3d(${x * (1 - z)}%, ${y * (1 - z)}%, 0) scale(${z})`;
```
- Transition: `transform 900ms cubic-bezier(0.33, 1, 0.68, 1)` (ease-out cubic).
- Add `will-change: transform; backface-visibility: hidden`.
- The function list is always `translate3d() scale()`, so it interpolates cleanly. Moving from one marker to another pans and zooms in one motion.

## Marker counter-scale
Markers keep their on-screen size. Each pin and the party button get `transform: scale(1 / z)` with the same 900ms ease-out transition. Their `left` and `top` are % positions with negative margins, so they scale around their own centre.

## Zoom levels and state
| State | z | Centre |
| --- | --- | --- |
| Nothing hovered or selected | 1 | (none) |
| Hovering or focusing a marker or list row | 1.22 | the hovered place |
| A place selected | 2.6 | the selected place (selection beats hover) |

- **Zoom-out delay on hover**: when the pointer leaves a marker, wait **220ms** before returning to 1×. Cancel the wait if another marker is hovered first. This stops the map bouncing in and out as the cursor crosses between nearby markers.
- **Clearing the selection** (× button, Esc, background click) sets `sel = null`, clears the hover and zoom state at once, and returns to 1×.
- Hover zoom while something is selected doesn't change the zoom; the selected place keeps 2.6×.

## Interaction with existing effects
- The **colour spotlight** (`clip-path: circle(11%)`) and the **party colour circle** (9%) sit inside the layer wrapper, so they zoom with the map. At 2.6× the spotlight covers more of the screen. This is intentional, and the circle-grow animation is unchanged.
- **Fog holes and drifting mist** zoom with the map and stay aligned to places.
- On **mobile below 760px**, the map sits in a horizontal scroll container. Zoom happens inside the clipped map box and doesn't change the scroll width. Touch has no hover, so only click zoom applies.

## Reduced motion
The zoom wrappers and pins carry `data-anim`. Under `prefers-reduced-motion: reduce`, the transition is off and zoom changes happen instantly.

## Files
- `reference/Map Section.dc.html`: the two zoom wrappers in the template (`zoomTf`, `pinInv`), `hoverOn` / `hoverOff` (the 220ms timer `this.zt`), `select()`, and `clearSel`. In `renderVals` see `zLevel` and `zp`.
