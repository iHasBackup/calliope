# Calendar

Route: `https://www.chocobie.site/calendar` · Source: `Calendar.dc.html` · Data: `calendar-data.js` (+ `campaign-content.js`)

Public, read-only page showing every campaign's sessions: past, current and upcoming. Edits happen in Campaign Admin → Schedule.

## Views
- **Week** (default, remembered per browser in `localStorage['chocobie-calendar-view']`). Monday start. Hour grid spans the earliest start to the latest end across all campaigns, plus one hour each side. Overlapping sessions split the column. A red line marks the current time on today. Below 760px it becomes a stacked day list.
- **Month**. Up to 3 session chips per day, then "+N more" (opens that week). Below 1024px chips become colour bars; tapping a day lists its sessions under the grid.
- **Agenda**. 8 weeks from the cursor, grouped by month, with a status tag per session.
- **Year**. 12 mini months; days with a session fill in the campaign colour. Clicking a month opens Month view.
- Toolbar: Today, previous/next (week ±7 days, month ±1, agenda ±28 days, year ±1), period title.

## Next session bar
- Full-width single-line bar above the toolbar (wraps on narrow screens): kicker (Next session / Tonight / At the table now), campaign, session number, "Wed 28 Oct, 19:00–23:00 GMT+7", and a relative label on the right (in N days / tomorrow / in N hours / Playing now; refreshes every 30s). Click opens the session.

## Session detail (drawer on ≥760px, bottom sheet below)
Session number and title (recap title if one exists), date, time + timezone, status (Played / Playing now / Tonight / Upcoming / Moved / Extra / Cancelled), move/cancel note, recap body + tags (only on the most recent played session; "No recap posted yet." if it has none), party roster as a 2-column grid of name + class tiles, open seats with "Apply for the seat" (only if registration is open), Add this session (.ics), Add all upcoming sessions (.ics, up to 60), Campaign home link. Esc or backdrop closes.

## Data model
Campaign: `id, title, system, tone (accent|ash|stone), start, end?, weekday (0=Sun), hour, duration, every (weeks), tz ('GMT+7'), homeUrl, registerUrl, openSeats, party[], recaps[{date,title,body,tags}], changes[]`.
Change: `{ type: 'cancel'|'move'|'extra', date, toDate?, toHour?, note? }`. Cancelled sessions stay visible (struck through) and are not numbered.
Sessions are generated every `every` weeks from `start` (aligned to `weekday`) to `end`, or 400 days ahead if open-ended. Recaps attach by date.
The Crooked Moon reads from `campaign-content.js` (`system`, `schedule.start/end/duration/changes`); the game system is edited in Admin → Campaign → Game (free text with suggestions) and shown in the session detail after the time. The other two campaigns (The Drowned Bell, Ashen Pilgrims) are **placeholders** in `calendar-data.js`.

## Admin: schedule changes + history
Admin → Schedule → Calendar has three actions: Cancel a session, Move a session, Extra session. Each opens one inline form (session date; new date for move; start time for move/extra; note) with **Submit** and Cancel. Submit validates dates, writes the change to `schedule.changes` and a row to `schedule.history` immediately (independent of the top Save button), then closes the form. Submitted changes are not listed in the Calendar panel; they appear in the **History** panel below (newest first, max 100): `{ id, changeId|undoOf, at, kind: cancel|move|extra|remove, action, detail, note }`. A history row whose change is still active has **Undo**, which removes the change and logs an "Undone" row.

## Backend
- `GET /api/calendar?from=&to=` → campaigns + expanded sessions (server does the expansion).
- `GET /api/calendar/:campaignId.ics` → subscribable feed (replace the client-side .ics download).
- Admin writes go through the existing campaign save endpoint (schedule object).

## Loading skeleton
Shows until campaign data has loaded: ink-tint blocks (`color-mix(in srgb, var(--color-bg) 7%, var(--color-text))`), zero radius, opacity pulse 1 → 0.45 → 1 over 1.4s (still under prefers-reduced-motion), `aria-busy="true"`, `aria-label="Loading calendar"`. Force with the `showSkeleton` prop.
