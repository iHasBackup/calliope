# Handoff: The Crooked Moon — Campaign Site

## Overview

A small public site for a weekly D&D campaign based on *The Crooked Moon*. Players need no accounts. The public site has three tabs: **Campaign** (home), **Recaps** and **Activities**. Activities links to the crossword game, which is specified separately in `CROSSWORD.md`. A passcode-protected **Admin** page (a simple CMS) is where the DM edits all site content; see `CMS.md`.

## About the design files

The files in `reference/` are **HTML design prototypes**. They show the intended look and behaviour; they are not production code. Recreate them in the target codebase's framework and conventions. If no codebase exists yet, a React + TypeScript SPA (Vite) is a good fit, with one route per tab (`/`, `/recaps`, `/activities`, `/activities/crossword`).

- `reference/CampaignHome.dc.html`: the public campaign site (all three tabs). It reads its content from the CMS store.
- `reference/CampaignAdmin.dc.html`: the admin CMS.
- `reference/campaign-content.js`: the content schema, sample content, and the load/save helpers both pages share (prototype persistence).
- `reference/Crossword.dc.html`: the crossword game and its leaderboard.
- `reference/modernist-styles.css`: design tokens and component classes (`.btn`, `.btn-primary`, `.grayscale`, and so on).
- `reference/image-slot.js`: the prototype's drag-and-drop image placeholder. **Do not ship it.** Replace it with real `<img>` elements fed from content.

The prototype uses its own template dialect:
- `{{ x }}` is a value hole.
- `<sc-for list as>` is a loop; `<sc-if value>` is a conditional.
- `class Component extends DCLogic` is a controller whose `renderVals()` supplies the template's values.

Translate these into components and hooks; don't try to run the dialect.

## Fidelity

**High fidelity.** Match colors, type, spacing and states closely, and take every value from the tokens in `modernist-styles.css`.

## Visual system

This is a **dark variant** of the Modernist system.

**Colors**
- Page ground: `--color-text` (#201e1d). Ink: `--color-bg` (#f3f2f2).
- Raised panels: `color-mix(in srgb, var(--color-bg) 7%, var(--color-text))`. This document calls it **panel**.
- Muted text: `--color-bg` at 60–85% (`color-mix(... N%, transparent)`).
- Accent: `--color-accent` (#ec3013). Accent text on dark uses `--color-accent-400`.
- Hairlines: `--color-bg` at 10–18%.

**Type**
- Everything is set in Archivo (`--font-heading`, `--font-body`).
- Headings: weight 800, uppercase, negative letter-spacing (-0.02 to -0.035em), line-height about 0.9.
- Kickers: 11px, weight 700, uppercase, letter-spacing 0.14–0.16em.

**Shapes and marks**
- **Zero border radius everywhere.** The only exception is the moon glyph described below.
- Diamond marks are 10–14px squares rotated 45°: used for the brand, quest bullets and timeline nodes.
- Images always sit inside the `.grayscale` wrapper.

**Page padding**
- Horizontal: `clamp(16px, 4vw, 48px)`.
- Section spacing: `clamp(48px, 7vw, 88px)`.

## Global header

Sticky at the top with z-index 20, a 92% `--color-text` background with `backdrop-filter: blur(8px)`, and a 1px hairline bottom border. It is a **single row that never wraps** (`flex-wrap: nowrap`), with padding `6px clamp(10px, 4vw, 48px)` and a min-height of 57px.

- **Left:** a red diamond plus "THE CROOKED MOON" (weight 800, uppercase, nowrap). Font size `clamp(12px, 3.9vw, 16px)`, letter-spacing `clamp(0.02em, 0.5vw, 0.08em)`. The full title always shows; it must never truncate or overlap the menu button, down to 320px.
- **Right, 640px and wider:** three inline tabs (Campaign, Recaps, Activities).
  - Size: 44px tall, padding `0 clamp(8px, 2.6vw, 14px)`, `clamp(11px, 3.2vw, 13px)` weight 700, uppercase.
  - Active tab: accent fill with white text. Inactive tabs: 75% ink.
- **Right, below 640px:** a 44×44 **burger button** (three 20×2px ink bars, 5px apart).
  - When open, the button fills with the accent and the bars animate into an ×: the top bar moves down 7px and rotates 45°, the middle bar fades out, and the bottom bar moves up 7px and rotates −45°, all over 0.2s.
  - `aria-label` switches between "Open menu" and "Close menu"; `aria-expanded` reflects the state.
- **Mobile menu panel:** `position: fixed` from `top: 57px` (flush under the header) to the bottom of the viewport, over a backdrop of the ground at 60%.
  - Inside is an ink panel with a 2px accent bottom border, listing the three tabs as rows at least 56px tall: 20px weight 800 uppercase, a → on the right, and a 1px hairline between rows. The active row has the accent fill.
  - It closes when you pick a tab, tap the backdrop, press Escape, or resize to 640px or wider.
- Tabs set the view and update the URL hash (`#recaps`, `#activities`). The hash is read on load. Switching views scrolls to the top.

## Campaign tab (home)

### 1. Hero

1. **Key-art band.** Full width, height `clamp(200px, 32vw, 400px)`, grayscale, with a `center / cover` background image taken from `keyArtUrl` in the CMS. The bottom 45% has a gradient scrim fading to the ground.
2. **Content row** below the key art: `flex-wrap: wrap`, `justify-content: space-between`, `align-items: flex-end`, gap 32px.
   - **Text column** (`flex: 1 1 320px`, max-width 720px):
     - Tags: "CURRENT ARC" (accent fill) and "CHAPTER II" (1px 40% outline).
     - H1 with the arc title, `clamp(38px, 8vw, 104px)`.
     - Arc description, `clamp(15px, 1.6vw, 18px)`, 85% ink, max-width 560px.
     - Two 48px buttons: "Catch up on recaps" (`.btn-primary`, opens Recaps) and "Play activities" (2px ink outline that inverts on hover, opens Activities).
   - **Next-session card**: `width: min(100%, 320px)`, 24px padding on all sides, gap 14px, accent background with white text, `box-shadow: 0 24px 60px rgba(0,0,0,.45)`.
     - Kicker: "NEXT SESSION · S08", i.e. the next session number.
     - A two-column grid with equal `1fr` columns showing the days and hours remaining. Numbers are 64px weight 800 with tabular figures, and the "DAYS" / "HOURS" labels are centered under them.
     - A 1px white-40% rule, then one line that doesn't wrap: `Wed 30 Sep · 7:00 PM GMT+7`. The day name is abbreviated to three letters.

### 2. Stat strip

A `flex-wrap` row with a 12px gap containing three panels, each padded 18px × 20px.

- **In-game night** (`flex: 1 1 150px`): a 44px moon glyph (a light square with an offset dark circle cut out of it) and the night count, zero-padded, at 34px.
- **Party level** (`flex: 1 1 150px`): the Lucide **swords** icon, 44px, stroked in the accent, and "Lv. 4". Don't repeat the number inside the icon.
- **Campaign progress** (`flex: 2 1 300px`): the label, then the percentage at 28px in the accent.
  - Below that, a **segmented bar**: 20 cells, 14px tall, 3px gap. Filled cells = `round(progress / 5)` in the accent; the rest are 14% ink.
  - A footer row that wraps: "Chapter II of the adventure" / "7 sessions played".

### 3. The party

- **Header row:** kicker "4 ADVENTURERS · 1 JOINING", H2 "THE PARTY".
- **Grid:** `repeat(N, minmax(0, 1fr))` with gap `clamp(10px, 1.6vw, 20px)` and no horizontal scroller. N depends on the viewport width:
  - Below 600px: N = 2.
  - 600–1099px: N = 3.
  - 1100px and up: N = the number of cards, capped at 5. All cards share one row on desktop; never leave a lone card on a second row.

**Card**
- `aspect-ratio: 3 / 4.2`, panel background, `container-type: inline-size`.
- A grayscale portrait fills the card, set as a `background-image` with `center / cover`. If there is no portrait URL, show an empty panel. The bottom 62% has a gradient scrim running from transparent to ink.
- Top-left badge: "LV 4" on an accent fill, 12px weight 800.

**Text block**

The text block sits at the bottom with inset `clamp(10px, 2.4vw, 14px)`. Its grid rows have **fixed heights** (`16px 30px 24px 18px`, gap 6px), so every card lines up regardless of text length. Every line is single-line with an ellipsis.

1. Species: 11px uppercase, `--color-accent-400`.
2. Name: `clamp(18px, 12cqi, 30px)`, weight 800, uppercase. It is sized relative to the card, not the viewport.
3. Class: an ink-on-light chip, 12px weight 700.
4. Subclass: 13px, 75% ink.

**Open-seat card:** shown when `showOpenSeat` is true. Its border is 25% ink, the badge reads "+1" on a muted fill, and the text is "Fifth player / Seat open / Joining soon / Class TBD".

### 4. Story and quest log

A two-column grid, `repeat(auto-fit, minmax(min(100%, 380px), 1fr))`.

- **Left:** kicker "NIGHTS 1–8", H2 "THE STORY SO FAR", and summary paragraphs at 16px / 1.65, 85% ink.
- **Right:** a panel with a 3px accent top border titled "QUEST LOG", showing "N active". Each open thread is a row: an outlined red diamond, then 15px text, with a hairline above. Blank threads are ignored; the panel is hidden when there are none.
- The kicker reads "NIGHTS 1–{nights}". `summary` is split into paragraphs on blank lines.

## Recaps tab

- Max-width 900px. Kicker "7 SESSIONS · 08 NIGHTS", H1 "SESSION RECAPS".
- **Vertical timeline**, newest first. Each entry is a two-column grid: a 20px rail column, then the card.
  - The rail has a 14px diamond node and a 2px hairline running down. The latest entry's node is solid accent; the others are hollow with a 50% ink border.
  - The card has a 1px hairline border.
    - **Header** (a full-width button, at least 44px tall): "SESSION 07" in accent-400, a meta line "Wed 16 Sep · Night 8", a "LATEST" chip on the newest entry, the title (`clamp(18px, 2.4vw, 24px)`, uppercase), and a 32px +/− box.
    - **Expanded:** a panel fill and brighter border, showing the body text (15px / 1.65, max-width 620px) and outlined location/topic tags.
  - **Accordion behaviour:** one entry is open at a time, the latest is open by default, and clicking the open entry closes it.

## Activities tab

- Kicker "BETWEEN SESSIONS", H1 "ACTIVITIES".
- Cards sit in `repeat(auto-fill, minmax(min(100%, 340px), 1fr))`. There is currently one card, the crossword:
  - **Thumbnail:** 16:9, a 7×3 grid of white and ink cells with 3px gaps.
  - **Tags:** a "LIVE" chip plus the kicker "PUZZLE · CROSSWORD".
  - **Title and description:** "PUZZLE NO. 01" and a one-line description.
  - **Stats list:** top score (from the crossword leaderboard: name, words/16) and the entry count.
  - **Button:** a "Play now" `.btn-primary` that routes to the crossword.
- Design new activities as more cards in the same grid.

## Data model

All site content is a single document edited in the CMS. `reference/campaign-content.js` contains the schema and the sample content.

```ts
Content {
  arcTitle: string; arcChapter: string; arcBlurb: string; keyArtUrl: string;
  nights: number;          // in-game nights
  progress: number;        // 0–100
  partyLevel: number;      // 1–20
  summary: string;         // paragraphs separated by a blank line
  threads: string[];       // quest log
  schedule: { weekday: 0–6; hour: 0–23; timezone: string /* display label, e.g. "GMT+7" */ };
  showOpenSeat: boolean;   // show the "Seat open" card
  party: { id; name; species; klass; sub; portraitUrl }[];
  recaps: { id; title; date /* YYYY-MM-DD */; nights: string /* "4–5" */; body: string; tags: string /* comma separated */ }[];
}
```

- **Recaps** are stored unordered. Sort them by `date`: session numbers come from that order (1 = earliest), and they are displayed newest first.
- **Empty party fields** fall back to "Species TBD", "Class TBD", "Subclass TBD" and "Unnamed".
- **Real content:** the story, threads and recaps in the sample are placeholder text. The DM replaces them through the CMS.

## Behaviour

**Next session**
- Find the next Wednesday at `schedule.hour`. If today is Wednesday and the session started less than 4 hours ago, it is still today's session.
- **Compute this in the campaign's timezone, not the viewer's.** The prototype uses the viewer's local time, which is wrong for players in other zones. Use `Intl`/Temporal or date-fns-tz with `schedule.timezone`.
- Recompute every 60s.
- Next session number = number of recaps + 1.
- **Also store an IANA zone** (e.g. `Asia/Jakarta`) in `schedule`. The prototype only has a display label.

**Stats and recaps**
- `sessionsPlayed` = number of recaps.
- Progress segments = `round(progress / 5)` of 20.

**Crossword leaderboard**
- The prototype reads the top score from `localStorage` (`crooked-moon-crossword-scores-v1`).
- In production, read it from the same shared scores API specified in `CROSSWORD.md` (`GET /api/scores?puzzle=crooked-moon-01`).

## Responsive

The layout is fluid everywhere, with no fixed widths. It was verified with no horizontal overflow at 320, 360, 768 and desktop widths.

- **Header:** a single row at every width. The brand label is hidden below 380px.
- **Hero:** the text column and next-session card stack on phones.
- **Stat strip:** night and level share a row; progress wraps onto its own full-width row.
- **Party:** two cards per row on phones, 3–5 on wider screens.
- **Story and quest log:** stack below about 800px.
- **Minimum sizes:** all tap targets are at least 44px, and body text is at least 15px.

## Assets

- **Images:** the key art and one portrait per party member are provided by the owner. Always render them grayscale.
- **Icons:** Lucide **swords** is the only icon. The moon glyph and the diamonds are pure CSS.
- **Font:** Archivo is imported by `modernist-styles.css`. Self-host it in production.

## Files

- `README.md`: this spec (the public campaign site).
- `CMS.md`: the admin CMS and content API spec.
- `CROSSWORD.md`: the crossword game and shared leaderboard spec.
- `reference/*`: the prototypes and stylesheet described above.
