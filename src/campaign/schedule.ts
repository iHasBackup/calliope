// Schedule changes (cancel / move / extra), their history log, and the
// session list the public calendar draws. Shared by the admin UI, the
// api/schedule.ts function and the calendar page — dependency-free.

import type { Content, Recap, Schedule, ScheduleChange, ScheduleChangeType, ScheduleHistory } from './content.js';
import { todayIn, zonedInstant } from './time.js';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const ACTION: Record<ScheduleChangeType, string> = { cancel: 'Cancelled', move: 'Moved', extra: 'Extra session' };

// ---- dates as YYYY-MM-DD strings (calendar days, no timezone) ----

export const pad = (n: number) => String(n).padStart(2, '0');
export function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
export function ymd(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
export function addDays(s: string, n: number): string {
  const d = parseYmd(s);
  d.setUTCDate(d.getUTCDate() + n);
  return ymd(d);
}
export const weekdayOf = (s: string) => parseYmd(s).getUTCDay();

export const hourLabel = (h: number) => `${h % 12 || 12}:00 ${h < 12 ? 'AM' : 'PM'}`;
export function shortDate(s: string): string {
  if (!s) return '?';
  const d = parseYmd(s);
  return `${DAYS[d.getUTCDay()].slice(0, 3)} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** "Session on Wed 4 Nov", "Wed 4 Nov → Thu 5 Nov, 7:00 PM", "Sat 7 Nov, 7:00 PM". */
export function describeChange(ch: ScheduleChange, weeklyHour: number): string {
  const hr = ch.toHour ?? weeklyHour;
  if (ch.type === 'cancel') return `Session on ${shortDate(ch.date)}`;
  if (ch.type === 'move') return `${shortDate(ch.date)} → ${shortDate(ch.toDate || ch.date)}, ${hourLabel(hr)}`;
  return `${shortDate(ch.date)}, ${hourLabel(hr)}`;
}

const uid = () => Math.random().toString(36).slice(2, 9);

export interface ChangeInput {
  type: ScheduleChangeType;
  date: string;
  toDate?: string;
  toHour?: number;
  note?: string;
}

/** Validation the admin form shows inline; the server repeats it. '' = valid. */
export function changeError(input: ChangeInput): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date || '')) return input.type === 'extra' ? 'Pick a date.' : 'Pick the session date.';
  if (input.type === 'move' && !/^\d{4}-\d{2}-\d{2}$/.test(input.toDate || '')) return 'Pick the new date.';
  return '';
}

/** Adds a change and its history row. Returns a new schedule. */
export function addScheduleChange(schedule: Schedule, input: ChangeInput, now = new Date()): Schedule {
  const change: ScheduleChange = { id: uid(), type: input.type, date: input.date, note: (input.note || '').trim() };
  if (input.type === 'move') change.toDate = input.toDate;
  if (input.type !== 'cancel' && input.toHour !== undefined) change.toHour = input.toHour;
  const row: ScheduleHistory = {
    id: uid(),
    changeId: change.id,
    at: now.toISOString(),
    kind: change.type,
    action: ACTION[change.type],
    detail: describeChange(change, schedule.hour),
    note: change.note,
  };
  return { ...schedule, changes: [...schedule.changes, change], history: [row, ...schedule.history].slice(0, 100) };
}

/** Removes a change and logs an "Undone" row. Unknown ids leave the schedule as is. */
export function undoScheduleChange(schedule: Schedule, changeId: string, now = new Date()): Schedule {
  const change = schedule.changes.find((x) => x.id === changeId);
  if (!change) return schedule;
  const row: ScheduleHistory = {
    id: uid(),
    undoOf: changeId,
    at: now.toISOString(),
    kind: 'remove',
    action: 'Undone',
    detail: `${ACTION[change.type]}: ${describeChange(change, schedule.hour)}`,
    note: '',
  };
  return { ...schedule, changes: schedule.changes.filter((x) => x.id !== changeId), history: [row, ...schedule.history].slice(0, 100) };
}

/** Same rule as the campaign site's Apply button: open, and the deadline (end of day, campaign time) not passed. */
export function registrationOpen(c: Content, now = new Date()): boolean {
  const reg = c.registration;
  if (reg.open === false) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reg.deadline)) return true;
  return todayIn(c.schedule.timezone, now) <= reg.deadline;
}

// ---- the calendar ----

export type Tone = 'accent' | 'ash' | 'stone';

export interface CalendarCampaign {
  id: string;
  title: string;
  system: string;
  tone: Tone;
  start: string;
  end: string;
  weekday: number;
  hour: number;
  duration: number;
  every: number; // weeks between sessions
  timeZone: string; // IANA, for the maths
  tzLabel: string; // "GMT+7", for display
  homeUrl: string;
  registerUrl: string; // '' when registration is closed
  openSeats: number;
  party: { name: string; klass: string }[];
  recaps: Recap[];
  changes: ScheduleChange[];
  status: 'running' | 'upcoming' | 'finished';
}

export interface CalendarSession {
  id: string;
  campId: string;
  orig: string; // the weekly date this session came from
  date: string; // the date it actually happens
  hour: number;
  duration: number;
  cancelled: boolean;
  extra: boolean;
  movedFrom: string;
  note: string;
  n: number; // session number; 0 for cancelled sessions, which are not counted
  recap: Recap | null;
  title: string;
  startMs: number;
  endMs: number;
}

/** The Crooked Moon as a calendar campaign, read from the site's content. */
export function campaignFromContent(c: Content, opts: { id: string; title: string; homeUrl: string; registerUrl: string; registrationOpen: boolean }): CalendarCampaign | null {
  const s = c.schedule;
  if (!s.start) return null;
  const today = todayIn(s.timezone);
  return {
    id: opts.id,
    title: opts.title,
    system: c.system,
    tone: 'accent',
    start: s.start,
    end: s.end,
    weekday: s.weekday,
    hour: s.hour,
    duration: s.duration,
    every: 1,
    timeZone: s.timezone,
    tzLabel: s.label,
    homeUrl: opts.homeUrl,
    registerUrl: opts.registrationOpen ? opts.registerUrl : '',
    // The seat shows while it is advertised; the drawer says when registration is closed.
    openSeats: c.showOpenSeat ? c.registration.seats : 0,
    party: c.party.filter((p) => p.name.trim()).map((p) => ({ name: p.name.trim(), klass: p.klass.trim() })),
    recaps: c.recaps,
    changes: s.changes,
    status: s.start > today ? 'upcoming' : s.end && s.end < today ? 'finished' : 'running',
  };
}

/** Every session of a campaign: weekly from start to end (or 400 days ahead), with changes applied. */
export function sessionsOf(c: CalendarCampaign): CalendarSession[] {
  const byDate = new Map<string, ScheduleChange>();
  c.changes.forEach((x) => {
    if (x.type !== 'extra') byDate.set(x.date, x);
  });
  const recapByDate = new Map<string, Recap>();
  c.recaps.forEach((r) => {
    if (r.date) recapByDate.set(r.date, r);
  });

  type Draft = Omit<CalendarSession, 'id' | 'n' | 'recap' | 'title' | 'startMs' | 'endMs'>;
  const out: Draft[] = [];
  let d = c.start;
  while (weekdayOf(d) !== c.weekday) d = addDays(d, 1);
  const stop = c.end || addDays(todayIn(c.timeZone), 400);
  const base = (date: string): Draft => ({ campId: c.id, orig: date, date, hour: c.hour, duration: c.duration, cancelled: false, extra: false, movedFrom: '', note: '' });
  while (d <= stop) {
    const x = byDate.get(d);
    const s = base(d);
    if (x?.type === 'cancel') {
      s.cancelled = true;
      s.note = x.note;
    } else if (x?.type === 'move') {
      s.date = x.toDate || d;
      s.hour = x.toHour ?? c.hour;
      s.movedFrom = d;
      s.note = x.note;
    }
    out.push(s);
    d = addDays(d, 7 * (c.every || 1));
  }
  c.changes.forEach((x) => {
    if (x.type === 'extra') out.push({ ...base(x.date), hour: x.toHour ?? c.hour, extra: true, note: x.note });
  });
  out.sort((a, b) => (a.date === b.date ? a.hour - b.hour : a.date < b.date ? -1 : 1));

  let n = 0;
  return out.map((s, i) => {
    const num = s.cancelled ? 0 : ++n;
    const recap = s.cancelled ? null : (recapByDate.get(s.date) ?? recapByDate.get(s.orig) ?? null);
    const startMs = zonedInstant(s.date, s.hour, c.timeZone);
    return {
      ...s,
      id: `${c.id}:${s.orig}${s.extra ? `:x${i}` : ''}`,
      n: num,
      recap,
      title: s.cancelled ? 'No session' : recap?.title || `Session ${num}`,
      startMs,
      endMs: startMs + s.duration * 3600000,
    };
  });
}

// ---- .ics export ----

const icsDate = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsText = (t: string) => t.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');

export function toIcs(c: CalendarCampaign, list: CalendarSession[], now = Date.now()): string {
  const events = list.map((s) =>
    [
      'BEGIN:VEVENT',
      `UID:${s.id}@chocobie.site`,
      `DTSTAMP:${icsDate(now)}`,
      `DTSTART:${icsDate(s.startMs)}`,
      `DTEND:${icsDate(s.endMs)}`,
      `SUMMARY:${icsText(`${c.title}${s.n ? ` · Session ${s.n}` : ''}${s.recap ? ` · ${s.recap.title}` : ''}`)}`,
      'URL:https://www.chocobie.site/calendar',
      'END:VEVENT',
    ].join('\r\n'),
  );
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Chocobie//Calendar//EN', 'CALSCALE:GREGORIAN', `X-WR-CALNAME:${icsText(c.title)}`, ...events, 'END:VCALENDAR'].join('\r\n');
}
