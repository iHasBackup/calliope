# Handoff: Campaign Home motion

## Overview
This is a **delta** on top of `design_handoff_crooked_moon/` (Campaign Home v2). It adds motion only. Layout, copy and data are unchanged:
1. A sliding red indicator on the header tabs (Campaign → Recaps → Activities).
2. A fade and slide-in when the page view changes.
3. A drop-in for the mobile menu.
4. Animated open and close for the session recap accordions.

## About the design files
`reference/Campaign Home v2.dc.html` is an **HTML design prototype**, not production code. Recreate the behaviour in the existing codebase with its own components and animation approach (CSS transitions are enough; no animation library is needed).

## Fidelity
High-fidelity. Modernist system: Archivo, zero radius, accent `#ec3013` (`--color-accent`), ground `#f3f2f2` (`--color-bg`), ink `#201e1d` (`--color-text`). The page is inverted: ink background, ground text.

## Easing tokens
- **Move**: `cubic-bezier(0.65, 0, 0.25, 1)`, symmetric ease-in-out. Used for the indicator and for collapsing height.
- **Enter**: `cubic-bezier(0.2, 0.7, 0.2, 1)`, ease-out. Used for things appearing.

## Reduced motion
Under `@media (prefers-reduced-motion: reduce)`, every animated element (`[data-anim]`) gets `animation: none` and `transition: none`. State still changes, just instantly.

---

## 1. Header tab indicator (inline tabs, ≥640px)
- The tabs container is `position: relative`; the tabs are a flex row with a 2px gap.
- One absolutely positioned red block (`--color-accent`) sits behind the tabs: top 0, left 0, 44px tall, `pointer-events: none`. Tab buttons are `position: relative` and transparent, so they paint above it.
- On tab change it moves to the target button's `offsetLeft` and takes its `offsetWidth`:
  - `transform: translateX(<offsetLeft>px)`
  - `width: <offsetWidth>px`
  - Transition: `transform 380ms <move>, width 380ms <move>`
- Tab text colour transitions over 260ms: white on the active tab, 75% ground on the others. Hover on an inactive tab sets the colour to full ground.
- The active tab has `aria-current="page"`.
- **Implementation notes. These caused bugs in the prototype, so follow them:**
  - Position the indicator **directly** (a ref and `el.style`), not through render-time style values that depend on an async state update. Otherwise it lags one click behind.
  - Pick the target button **by index** in the tab list. Button positions don't depend on which tab is active, so you can measure before the state change.
  - **First placement** (on mount, after fonts load, and on resize) uses no transition. On the first click, if the indicator hasn't been placed yet, place it under the current tab without a transition, force a reflow, then set the target with the transition, so the first click also slides.
  - Re-measure on `document.fonts.ready` (Archivo changes the widths) and on `resize`.
- The Apply tab navigates to Registration; there is no slide for it.

## 2. View change (Campaign / Recaps / Activities)
- The root of each view mounts with `@keyframes cm-view-in { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }`, running for 360ms with the enter easing and `both` fill.
- It plays every time a view mounts. Scroll still resets to the top, and the URL hash updates as before.

## 3. Mobile menu (<640px)
- The dropdown panel mounts with `@keyframes cm-menu-in { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: none } }`, running for 220ms with the enter easing.
- The burger-to-X morph is unchanged.

## 4. Recap accordion
The body is now **always mounted**; open and close are animated rather than mounting and unmounting it.
- **Height**: the wrapper is `display: grid; grid-template-rows: 0fr | 1fr`, with the transition `grid-template-rows 380ms <move>`. Its child has `min-height: 0; overflow: hidden`.
- **Content**: `opacity 0 → 1` over 300ms ease and `translateY(-6px → 0)` over 380ms with the enter easing. When opening, both start after an **80ms delay**, so the height leads; when closing there is no delay.
- **Hidden state**: when closed, the wrapper is `visibility: hidden` and `aria-hidden="true"`, so links inside can't be tabbed to. Visibility switches with `visibility 0s linear 380ms` when closing (after the collapse) and with no delay when opening.
- **Card**: background and border colour transition over 280ms. Open uses a 7% ground tint with a 20% ground border; closed is transparent with a 10% border.
- **+/− button** (32×32): rotates `0 → 180deg` over 340ms with the move easing. When open it fills red with a red border and white glyph; when closed it is transparent with a 30% ground border and ground glyph. The colours transition over 240ms. The glyph swaps between + and −.
- Behaviour is unchanged: one recap open at a time, and the latest opens by default.

## Files
- `reference/Campaign Home v2.dc.html`: see `placeInd()` / `go()` in the logic, the `[data-tab-ind]` element, the `@keyframes` in `<helmet>`, and the recap item with `rows`, `op`, `ty` and `signRot` in `renderVals()`.
