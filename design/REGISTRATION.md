# Handoff: Player Registration and Applications

## Overview

This is a public application flow for open seats at the table, plus two admin sections: **Registration** (settings) and **Applications** (review). Players don't need an account. They fill in four sections, review their answers and submit. The DM screens applications in the CMS, and accepting one adds that character to the party.

References:
- `reference/Registration.dc.html`: the public flow (intro, form, review, done, closed).
- `reference/CampaignAdmin.dc.html`: the Registration and Applications sections of the CMS.
- `reference/registration-sections.js`: the question sets, option lists, answer summary and prototype persistence.
- `reference/class-modules.js`: the source books with their species, classes and subclasses.
- `reference/campaign-content.js`: the `registration` block of the Content document.

These are **HTML design references**, not production code. Recreate them in the target stack, following README.md → About the design files (template dialect, recommended stack) and README.md → Visual system (dark Modernist, zero radius, Archivo, accent #ec3013).

## Fidelity

**High fidelity.** Copy is final. Use the option lists exactly as they appear in `registration-sections.js` and `class-modules.js`.

## Data model

```ts
// Inside Content (campaign-content.js)
registration: {
  open: boolean;              // manual switch
  seats: number;              // 1–8
  deadline: string;           // 'YYYY-MM-DD'; closes 23:59:59 that day; '' = no deadline
  modules: string[];          // active source ids, e.g. ['phb','dmg','tcm']; [] = fall back to defaults
  allowHomebrew: boolean;     // shows the "Other" tile for species and class
  intro: string;              // intro paragraph on the registration page
  fitTitle: string;           // section 2 title
  fitIntro: string;           // section 2 intro
  fitQuestions: { id; type: 'choice' | 'text'; required: boolean; prompt: string; options: string[] }[];
}

Application {
  id; submittedAt /* ISO */; status: 'new' | 'shortlisted' | 'accepted' | 'declined';
  // 01 General
  discord; experience; aspects: string[] /* max 2 */; playstyle: string[]; lines; veils; pitch;
  // 02 Campaign fit
  fit: Record<questionId, string>; fitSnapshot: { id; prompt }[];   // prompts frozen at submit time
  // 03 Vibe check
  bond; bondNote; conflict; conflictNote;
  spotlight; spotlightNote; bigMoment; bigMomentNote; pcImpact; pcImpactNote; raw; rawNote; secrets; secretsNote;
  conduct: ['agreed'];
  // 04 Character
  name; species; speciesOther;
  multiclass: boolean;
  classes: { klass; klassOther; sub; lv: number | null }[];   // 1 entry when single class, 2–3 when multiclass
  klass; klassOther; sub;    // mirror of classes[0], kept for older readers
  backstory; faceUrl;
}
```

**Source modules** (`class-modules.js`): `MODULES[]` = `{ id, abbr, name, species: string[], classes: { [classKey]: string[] /* subclasses */ } }`. `BASE[]` holds class metadata (`label, hd, ab, role`). A class only appears if at least one active module lists subclasses for it. Species keys are kebab-cased labels. The DM wants this list kept as a **code-owned file**, with no editing UI; changes ship as code.

Current modules and their abbreviations: PHB (PHB 2024), DMG (DMG 2024), ExE (Exploring Eberron), AU (Arcana Unleashed), EFA (Eberron: Forge of the Artificer), FEQ (Frontiers of Eberron: Quickstone), RHW (Ravenloft: The Horrors Within), TCM (The Crooked Moon), GH (Grim Hollow). Defaults: PHB, DMG, TCM.

## Public page

### Shell
- Same sticky 57px header as the site, with a 1px hairline at the bottom.
- **Right side of the header:** "Draft saved on this device" (12px, 55% ink, only while in the form at 900px and wider), then a "Back to campaign" link ("Exit" below 560px).
- Page cap 1440px, page padding `clamp(16px, 4vw, 48px)`.

### Intro (open)
Two-column grid, `repeat(auto-fit, minmax(min(100%, 420px), 1fr))`.

**Left column**
- Kicker: diamond + "APPLICATIONS OPEN · 1 SEAT".
- H1 "APPLY FOR A SEAT", `clamp(44px, 8vw, 104px)`.
- `intro` paragraph.
- **Apply-by block** (when there is a deadline): a panel with a 3px accent left border.
  - Left: "APPLY BY" plus the date ("31 Oct 2026").
  - Right: a solid-accent box, min-width 96px, holding the day count (40px, weight 800, white, tabular figures) with "DAYS LEFT" under it.
  - When 1 day or less is left, it shows "Today" over "CLOSES AT MIDNIGHT".
  - The block spans the full width above the next two tiles.
- Two panel tiles: "SESSIONS" ("Wednesdays, 7:00 PM GMT+7") and "YOU JOIN AT" ("Level 4").
- Buttons: "Begin application" (`.btn-primary`, 52px). With a saved draft it reads "Continue application", and an outlined "Start over" button appears (confirm, then clear the draft).

**Right column**
- A "FOUR SECTIONS" panel with a 3px accent top border, listing 01–04 with a title and a one-line description each.

### Intro (closed)
- Closed when `open` is false **or** the deadline has passed. Kicker "APPLICATIONS CLOSED", H1 "THE TABLE IS FULL".
- Text after the deadline: "Applications closed on {date}. Thanks to everyone who applied. Keep an eye on the campaign page for the next opening."
- Text when closed manually: "The DM is not taking new players right now. Check back after the current arc."
- No form is reachable while closed.

### Form
- **Progress, 1200px and wider:** a 240px sticky left rail (top 89px) listing the 4 steps as 52px rows (number, title, ✓). Only steps up to `maxStep` can be clicked.
- **Progress, below 1200px:** a 4-segment bar, 6px tall with 3px gaps, above the step header.
- **Step header:** "SECTION 02 OF 04", H2 `clamp(34px, 5.5vw, 64px)`, intro at 16px / 78% ink.
- **Questions:** separated by 1px hairlines with 28px vertical padding.
  - Number (13px, weight 800, accent-400, "01", "02"…), label (`clamp(18px, 2.2vw, 22px)`, weight 800), "Required"/"Optional" on the right, optional help text.
  - **Numbers are plain and sequential within each section, with no "1.1" style prefixes.** "Tell us more" follow-ups have **no number** and don't take one.
- **Choice tiles:** grid `repeat(auto-fill, minmax(min(100%, colMin), 1fr))`, gap 8px.
  - Each tile: min-height 56px, padding 14×16, 2px border at 30% ink. Selected: accent border with a 16% accent tint.
  - Marker: a 12px square, rotated 45° for single choice, unrotated for multi. Filled with the accent when selected.
  - Label weight: **600 when the option has a description line, 400 when it has no description.**
- **Inputs:** 48px tall, 16px font, 1px border at 22% ink, accent border on focus. Textareas are the same width and resize vertically.
- **Errors:** they only show after a Next attempt on that step. The field border turns accent, with a 13px weight-600 accent-400 message underneath.
- **Bottom nav (sticky):**
  - Left: "Back". On step 1 it returns to the intro.
  - Middle: a note reading "{Title} · 2 of 4" (just "2 of 4" below 640px). After a failed attempt it reads "N answers need attention" in accent-400.
  - Right: a primary button, "Next: {next title}" ("Next" below 640px). On step 4 it reads "Review".

### Section 01: General information
1. Discord name / tag (input, required).
2. How much D&D have you played? (single, `EXPERIENCE`).
3. What do you enjoy most in D&D? (multi, **max 2**, `ASPECTS`). Once two are picked, the remaining tiles drop to 45% opacity and can't be clicked.
4. What kind of player are you at the table? (multi, `PLAYSTYLES`: 15 archetypes, The Roleplayer through The Casual, with "Help me figure it out" last). "Help me figure it out" is **exclusive**: picking it clears the other picks, and picking any other option clears it.
5. Lines (textarea, optional).
6. Veils (textarea, optional).
7. What makes you interesting for this campaign? (textarea, required).

### Section 02: Campaign fit
Rendered from `registration.fitQuestions`; prompts left blank are skipped. `choice` renders single-choice tiles; `text` renders a textarea. `required` is set per question. When an application is submitted, store `fitSnapshot` so later edits to the questions don't change what the applicant answered.

### Section 03: Vibe check
1. How do you usually bond with the other players? (single, `BOND`, last option "Other").
   - Unnumbered follow-up: "Tell us more about how you blend in with a group". It is always shown, and **required only when Other is picked**.
2. If a problem or conflict comes up at the table…? (single, `CONFLICT`, with Other).
   - Unnumbered follow-up: "Anything the DM should know about how you handle conflict?". Same rule.
3–7. The five `VIBE_QS` (spotlight, big moment, PC decisions, RAW rulings, secrets). Each is a single choice with options a–d plus Other.
   - When **Other** is picked, an unnumbered "Tell us more" textarea appears directly below it and is required.
   - It is hidden otherwise. Store the text as `{id}Note`.
8. Do you understand and agree with the table's conduct policy?
   - The policy text is shown as help text, with a single **checkbox tile** (unrotated square marker) reading "Understood and agreed".
   - It is required. Error: "You need to agree to the conduct policy to apply."

### Section 04: Your character
A character-creation layout with a live character card.

**Live card**
- **900px and wider:** a 300px column on the right, sticky at top 89px.
  - A 3:4.2 portrait panel. The image is `faceUrl`, grayscale, `center top / cover`, with a bottom scrim. With no image it shows a monogram.
  - Top of the card: an "LV {n}" accent badge on the left and "NEW RECRUIT" on the right.
  - Text: species (accent-400), name (`clamp(22px, 11cqi, 32px)`), a class chip, the subclass line, and a 2-cell grid showing "Hit die" and "Primary". For multiclass, Hit die lists one value per class ("d8 / d12").
  - A 4-segment completeness bar (name, species, class, backstory). The card border turns accent when all four are done.
- **Below 900px:** a compact sticky strip (top 57px) instead: a 52px monogram box, the name, "Species · Class" and an LV badge.

**Blocks**
Separated by hairlines. Each has a "01"… number and a 22px uppercase label.

1. **Name.** A 60px input.
2. **Species.**
   - Tiles in `repeat(auto-fill, minmax(min(100%, 132px), 1fr))`, min-height 64px.
   - The top line shows the **source abbreviation** (10px, letter-spacing 0.1em, 65%). The label is 14px, weight 800, uppercase, `overflow-wrap: anywhere`, `min-width: 0` on the tile.
   - Long names like "Harvestborn" must wrap inside the tile on phones and never overflow it.
   - The list is built from the species of the active modules, in module order. "Other" (tagged HB) is added when `allowHomebrew`; picking it shows a free-text field.
3. **Class.** The header reads "Joining at level {partyLevel}".
   - **Mode choice:** two tiles, "Single class" ("All N levels in one class.") and "Multiclass" ("Split your N levels across two or three classes.").
     - Below level 2 the multiclass tile is disabled.
     - **At level 1 the whole mode choice is hidden** and the player picks a single class.
   - **Class tiles:** `minmax(min(100%, 140px), 1fr)`, min-height 88px.
     - Top row: the source abbreviation tag (1px currentColor box) on the left and the hit die on the right.
     - Bottom: the class name (16px, weight 800, uppercase), then "Role · Ability" underneath.
     - "Other" appears only when `allowHomebrew`, and asks for a free-text class name.
   - **Subclass:** chips in `minmax(min(100%, 150px), 1fr)`, min-height 44px. The source abbreviation is shown above each name. There is no Other or Undecided option, and picking the selected chip again deselects it.
     - **Subclass is hidden when the relevant level is below 3**: the joining level for single class, or that class's own level when multiclassing.
     - Dropping below level 3 clears any subclass already picked.
   - **Multiclass:**
     - **Level split bar:** 36px tall, 3px gaps. Each segment's flex is proportional to its level and is labelled "A · Fighter 3". Segment colors: accent, ink, and accent-300.
     - Note: "Levels always add up to {N}. Raising one class takes a level from another."
     - **One bordered card per class:**
       - Header: a letter badge (A/B/C), "CLASS A" and the class name, then a stepper with 44×44 − and + buttons around the level.
       - "+" takes a level from the class with the most levels above 1.
       - "−" gives the level back to class A (or to B, when the stepper is on A).
       - Each class must keep at least 1 level.
     - A class already used in another card shows as "Taken" at 35% opacity.
     - The **"Remove class"** link appears only when there are 3 classes; its levels go back to class A. "+ Add a third class" appears while the level allows it.
     - Switching to multiclass starts at A = N−1 and B = 1. Switching back to single drops every class after A.
4. **Backstory.** A textarea with a live word count. Required.
5. **Face claim image URL.** Optional. Accepts only `http(s)://` URLs; anything else shows a hint and no preview.

**Validation messages**
- "Your character needs a name."
- "Pick a species." / "Name the species."
- "Pick a class." / "Name the class." / "Pick and name a class for every slot."
- "Write at least a few lines of backstory."

### Review
- One panel per section: a number, the title and an "Edit" link that jumps to that step.
- Each answer is shown as a question/answer row. Empty answers render in 40% ink.
- Notes typed after picking Other are appended to their answer after a blank line.
- Multiclass reads "Fighter 3 / Rogue 1". Each subclass is prefixed with its class ("Fighter: Champion").
- "Submit application" checks all 4 steps again and jumps to the first one with errors.

### Done
- Title "{Name} is on the list" ("Your application is in" without a name).
- Text: "The DM reads every application and will reply to {discord} on Discord."

## Admin: Registration section

Panels, top to bottom:

1. **Status**
   - A square switch for open/closed.
   - "Seats open" (1–8) and "Deadline · closes end of day" (a date field).
   - A note under the deadline. With no date: "No deadline. Applications stay open until you switch them off." After the deadline: "Deadline passed. The registration page now shows applications as closed." (in accent-400).
   - "Intro on the registration page" (a textarea).
2. **Standard sections:** a read-only list of 01, 03 and 04, each with a "STANDARD" tag.
3. **Character sources**
   - Rows 52px tall, laid out as an 18px checkbox, a 48px abbreviation (accent-400) and the name, with "10 species · 12 classes · 48 subclasses" underneath.
   - The first row is "HB · Allow homebrew" ("Adds an Other tile to species and class so applicants can name their own").
   - If every source is turned off, a note says applicants will see the defaults.
4. **Section 02: Campaign fit · this campaign only**
   - Section title and intro fields.
   - One card per question: Q number, a type select ("Pick one answer" / "Written answer"), a Required checkbox, a move-up arrow, "Remove", and the question textarea. Choice questions also get "Answers · one per line".
   - "+ Add question".

Like the rest of the CMS, these settings go live on **Save**.

## Admin: Applications section

- Note: "N applications · M new. Status changes save immediately."
- Each application is an accordion row showing Discord/name, a meta line and a status. When opened, it shows the status buttons (New / Shortlisted / Accepted / Declined) and the full summary in the same format as Review. There is also a Delete link (with confirmation).
- **Status changes save immediately**, without waiting for Save.
- **Accepting an application adds the character to `party`.** The new member is `{ appId, name (falls back to discord), species, klass: "Fighter 3 / Rogue 1", sub, portraitUrl: faceUrl }`, and it is saved straight away.
  - Moving the status away from Accepted removes the member with that `appId`.
  - Adding happens only once per application.
  - If the DM has unsaved edits elsewhere, keep them as a draft; only the party change is committed.

## Production notes

- **Prototype storage:** the draft is stored in `localStorage` (`crooked-moon-application-draft-v1`) and is fine to keep client-side. Applications are also in `localStorage` (`crooked-moon-applications-v1`), which is **not** acceptable in production.
- **`POST /api/applications`** (public):
  - Validate the same rules server-side, against the module list active at submit time.
  - Reject the request if registration is closed or past the deadline. Evaluate the deadline in the campaign's IANA timezone (see README → Behaviour).
  - Rate-limit by IP.
- **`GET /api/applications`, `PATCH /api/applications/:id { status }` and `DELETE /api/applications/:id`** are admin-only.
  - The PATCH that sets `accepted` should insert the party member in the same transaction, and remove it when the status moves away from accepted.
- **Days left:** `ceil((deadline 23:59:59 − now) / 1 day)`. Recompute it on load and once a minute.
- **Face claim URLs:** consider proxying or validating them (content type and size) before showing them in admin.

## Responsive checkpoints

Check that nothing overflows horizontally at 320, 360, 768, 1024 and 1440px.

- 1200px: the rail turns into the segment bar.
- 900px: the tall character card turns into the sticky strip.
- 640px: the nav labels shorten.
- 560px: the header link reads "Exit".

All tap targets are at least 44px and inputs use a 16px font.
