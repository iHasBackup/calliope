# Handoff: The Crooked Moon — Campaign Site

## Overview

A small public site for a weekly D&D campaign based on *The Crooked Moon*. There are no accounts. It has three tabs: **Campaign** (home), **Recaps** and **Activities**. Activities links to the crossword game, which is specified separately in `CROSSWORD.md`.

## About the design files

The files in `reference/` are **HTML design prototypes**. They show the intended look and behaviour; they are not production code. Recreate them in the target codebase's framework and conventions. If no codebase exists yet, a React + TypeScript SPA (Vite) is a good fit, with one route per tab (`/`, `/recaps`, `/activities`, `/activities/crossword`).

- `reference/CampaignHome.dc.html`: the campaign site (all three tabs, data and logic).
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

Sticky at the top with z-index 20, a 92% `--color-text` background with `backdrop-filter: blur(8px)`, and a 1px hairline bottom border. It is a **single row that never wraps** (`flex-wrap: nowrap`), with padding `6px clamp(10px, 4vw, 48px)`.

- **Left:** a red diamond plus "THE CROOKED MOON". The label is `clamp(12px, 3.4vw, 16px)`, weight 800, letter-spacing 0.08em, and ellipsizes if space runs out. Below 380px viewport width the label is hidden and only the diamond remains.
- **Right:** three tabs (Campaign, Recaps, Activities).
  - Size: 44px tall, padding `0 clamp(8px, 2.6vw, 14px)`, `clamp(11px, 3.2vw, 13px)` weight 700, uppercase.
  - Active tab: accent fill with white text.
  - Inactive tabs: 75% ink.
- Tabs set the view and update the URL hash (`#recaps`, `#activities`). The hash is read on load. Switching views scrolls to the top.

## Campaign tab (home)

### 1. Hero

1. **Key-art band.** Full width, height `clamp(200px, 32vw, 400px)`, grayscale. The bottom 45% has a gradient scrim fading to the ground. The key art is supplied by the owner.
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
- **Grid:** `repeat(auto-fill, minmax(min(100%, 148px), 1fr))` with gap `clamp(10px, 2vw, 14px)`. That gives two cards per row on phones and wraps naturally; there is no horizontal scroller.

**Card**
- `aspect-ratio: 3 / 4.2`, panel background, `container-type: inline-size`.
- A grayscale portrait fills the card. The bottom 62% has a gradient scrim running from transparent to ink.
- Top-left badge: "LV 4" on an accent fill, 12px weight 800.

**Text block**

The text block sits at the bottom with inset `clamp(10px, 2.4vw, 14px)`. Its grid rows have **fixed heights** (`16px 30px 24px 18px`, gap 6px), so every card lines up regardless of text length. Every line is single-line with an ellipsis.

1. Species: 11px uppercase, `--color-accent-400`.
2. Name: `clamp(18px, 13cqi, 26px)`, weight 800, uppercase. It is sized relative to the card, not the viewport.
3. Class: an ink-on-light chip, 12px weight 700.
4. Subclass: 13px, 75% ink.

**Open-seat card:** shown when `showOpenSeat` is true. Its border is 25% ink, the badge reads "+1" on a muted fill, and the text is "Fifth player / Seat open / Joining soon / Class TBD".

### 4. Story and quest log

A two-column grid, `repeat(auto-fit, minmax(min(100%, 380px), 1fr))`.

- **Left:** kicker "NIGHTS 1–8", H2 "THE STORY SO FAR", and summary paragraphs at 16px / 1.65, 85% ink.
- **Right:** a panel with a 3px accent top border titled "QUEST LOG", showing "N active". Each open thread is a row: an outlined red diamond, then 15px text, with a hairline above.

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

All of this is hard-coded in the prototype. Move it into a content source: JSON/MDX in the repo, a headless CMS, or a small database. The campaign owner edits it weekly.

```ts
Campaign {
  title: string; arcTitle: string; arcChapter: string; arcBlurb: string;
  nights: number;          // in-game nights (8)
  progress: number;        // 0–100 (24)
  partyLevel: number;      // 4
  summary: string[];       // paragraphs
  threads: string[];       // quest log
  keyArtUrl?: string;
  schedule: { weekday: 3 /* Wed */; hour: 19; timezone: string /* IANA, e.g. "Asia/Jakarta" */; label: string /* "GMT+7" */ };
}
PartyMember { id; name; species; className; subclass; portraitUrl?; }   // 4 today, 5th joining
Recap { number; title; date /* ISO */; nights: string /* "4–5" */; body: string; tags: string[]; }
```

Current party data (species not provided yet; the card shows "Species TBD"):

| Name | Class | Subclass |
| --- | --- | --- |
| Oberon | Sorcerer | Wild Magic |
| Hayden | Death Knight | TBD |
| Carmen | Druid | TBD |
| Ambary | Rogue | TBD |

The story summary, quest threads and the seven recaps in the prototype are **placeholder copy**. Load the real content from the source.

## Behaviour

**Next session**
- Find the next Wednesday at `schedule.hour`. If today is Wednesday and the session started less than 4 hours ago, it is still today's session.
- **Compute this in the campaign's timezone, not the viewer's.** The prototype uses the viewer's local time, which is wrong for players in other zones. Use `Intl`/Temporal or date-fns-tz with `schedule.timezone`.
- Recompute every 60s.
- Session number = number of recaps + 1.

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

- `README.md`: this spec (campaign site).
- `CROSSWORD.md`: the crossword game and shared leaderboard spec.
- `reference/*`: the prototypes and stylesheet described above.
