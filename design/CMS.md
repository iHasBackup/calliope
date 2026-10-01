# Handoff: Campaign Admin (simple CMS)

## Overview

This is a single passcode-protected page where the DM edits everything the public site shows: the arc, stats, story, schedule, party, recaps and quest log. It has no user accounts and no roles; it's one editor. The reference is `reference/CampaignAdmin.dc.html`. It shares the schema in `reference/campaign-content.js` with the public site (see the Data model section of README.md).

Use the same dark Modernist treatment as the public site. Tokens, header, panels and type all follow README.md → Visual system.

## Prototype vs production

- **Prototype:** content is saved to `localStorage` (`crooked-moon-content-v1`), and the public page re-reads it on the `storage` event and when the tab becomes visible. The passcode is checked in the client (`crookedmoon`). **Neither is acceptable in production.**
- **Production:**
  - `GET /api/content` is public and returns the Content document. Cache it briefly (e.g. 60s) or revalidate on save.
  - `PUT /api/content` requires the admin session. It validates the whole document server-side (types, ranges: progress 0–100, level 1–20, weekday 0–6, hour 0–23), trims strings, caps lengths, and stores it with an `updatedAt` timestamp. Reject the write if `updatedAt` doesn't match what the client loaded, so two open tabs can't overwrite each other.
  - **Auth:** `POST /api/admin/login` takes `{ passcode }` and compares it to an env secret. It sets an httpOnly, secure, SameSite=strict session cookie. Rate-limit it.
  - **Images:** replace the URL fields with uploads to object storage (S3, R2, Supabase Storage). Keep the stored value a URL so the schema doesn't change.
  - Any small store works for the document itself: a JSON row in Postgres or SQLite, a KV entry, or a single Firestore document.
- A static site plus one serverless function is enough. The crossword's scores API (CROSSWORD.md) can live in the same backend.

## Layout

### Header

Same sticky header as the site (57px min-height, single row).

- **Left:** the diamond, "THE CROOKED MOON" (hidden below 520px), and an outlined "ADMIN" tag.
- **Right** (after unlocking):
  - A status line: "Unsaved changes" in accent-400, "All changes saved", or a 2-second "Saved" flash. Hidden below 640px.
  - A "View site" link.
  - A 44px `.btn-primary`. It reads "Save" while there are unsaved changes and "Saved" at 45% opacity when there are none.

### Gate (locked)

Left-aligned, max-width 520px:
- Kicker "DUNGEON MASTER ONLY", H1 "CAMPAIGN ADMIN" and a one-line explanation.
- A password field (48px) and an "Unlock" button. Enter submits.
- Error line: "That passcode is not right."

### Editor (unlocked)

A flex-wrap row:
- **Section nav** (`flex: 1 1 200px`, max 240px, sticky at `top: 80px`): five 44px buttons (Campaign, Schedule, Party, Recaps, Quest log). The active one has the accent fill. Each shows a count where relevant. Below it: "Changes go live on the site when you save. Ctrl/⌘ + S also saves." and a "Reset to sample content" link.
- **Content column** (`flex: 999 1 480px`, max 820px).
- **Below 820px:** the nav becomes a wrapping horizontal row above the content, and the reset link moves to the end of the content.

**Section header:** an H2 (`clamp(28px, 4vw, 44px)`, uppercase), a 14px muted description, and an outlined "+ Add…" button on the right where it applies.

**Panels:** background `color-mix(in srgb, var(--color-bg) 7%, var(--color-text))`, padding `clamp(16px, 3vw, 24px)`, gap 18px.

**Fields:**
- Label: 11px, weight 700, uppercase, letter-spacing 0.14em, 65% ink.
- Input: 44px tall, ground-colored background, 1px border at 22% ink, border turns accent on focus, radius 0.
- **Font size 16px**, so iOS doesn't zoom on focus.
- Textareas resize vertically. Field rows use `repeat(auto-fit, minmax(min(100%, 180–220px), 1fr))`.

## Sections

1. **Campaign**
   - **Current arc** panel: arc title, chapter label, arc description (textarea), key art URL.
   - **Stats** panel: nights, party level, progress %, plus a live 20-segment preview of the progress bar.
   - **The story so far** panel: one textarea, with paragraphs separated by a blank line.
2. **Schedule:** a day select (Sunday–Saturday), a start-time select (24 hourly options shown in 12-hour format) and a timezone label. A live preview underneath reads e.g. "Wed 30 Sep · 7:00 PM GMT+7".
3. **Party**
   - A toggle row, "Show an open seat card for a player who is joining": a 42×24 square switch, filled with the accent when on.
   - One panel per member: an 88px 3:4 grayscale portrait preview (the name's initial if there is no image), "MEMBER 01", a Remove button (asks for confirmation), then Name, Species, Class, Subclass and Portrait URL fields.
   - "+ Add member" appends an empty member.
4. **Recaps**
   - A newest-first accordion; any number of entries can be open.
   - **Collapsed row:** "S07", the title (ellipsized), a meta line "Wed 16 Sep 2026 · Night 8", and a +/− box.
   - **Open entry:** Title, Session date (date input), In-game night(s), What happened (textarea), Tags (comma separated), and a "Delete this recap" link (asks for confirmation).
   - "+ New recap" adds an entry dated one week after the latest recap and opens it.
5. **Quest log:** a panel with a 3px accent top border. Each row has a diamond, a 2-row textarea and a 44×44 × remove button. "+ Add thread" appends a row. When the list is empty it notes that the quest log is hidden on the site.

## Behaviour

- All edits change a local draft. **Nothing goes live until Save.**
- **Dirty state:** the draft differs from the last saved copy.
- Ctrl/⌘+S saves.
- `beforeunload` warns if there are unsaved changes.
- Destructive actions (remove member, delete recap, reset) confirm first.
- Number inputs are clamped to their ranges.
- "Reset to sample content" restores the defaults. In production, remove it or turn it into "Revert to last saved".
