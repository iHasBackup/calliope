const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number;
  weekday: number; // 0=Sunday
  hour: number;
  minute: number;
  second: number;
  offsetMinutes: number; // zone offset from UTC, e.g. +420 for GMT+7
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function zonedParts(instant: Date, timeZone: string): ZonedParts {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(instant)) parts[p.type] = p.value;

  const offsetFmt = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' });
  const offsetPart = offsetFmt.formatToParts(instant).find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+00:00';
  const m = offsetPart.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  const offsetMinutes = m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0)) : 0;

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekday: WEEKDAY_INDEX[parts.weekday] ?? 0,
    hour: parts.hour === '24' ? 0 : Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    offsetMinutes,
  };
}

/** Converts a wall-clock date/time as observed in `timeZone` into the UTC
 * instant it represents (assuming the zone's offset stays constant across
 * the small time span involved — true for a one-week lookahead outside of
 * a DST transition). */
function zonedWallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  offsetMinutes: number,
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second) - offsetMinutes * 60000);
}

export interface NextSession {
  date: Date; // the actual instant, for countdown math
  dateLabel: string; // "Wed 30 Sep"
  timeLabel: string; // "7:00 PM"
}

/** Next occurrence of `weekday` at `hour:00` in `timeZone`. If today is
 * already that weekday and it started less than 4 hours ago, treats it as
 * still being tonight's session rather than jumping a week ahead. */
export function nextSession(now: Date, weekday: number, hour: number, timeZone: string): NextSession {
  const z = zonedParts(now, timeZone);
  let addDays = (weekday - z.weekday + 7) % 7;

  const todayTarget = zonedWallTimeToUtc(z.year, z.month, z.day, hour, 0, 0, z.offsetMinutes);
  if (addDays === 0 && now.getTime() > todayTarget.getTime() + 4 * 3600000) addDays = 7;

  const targetDayUtcNoon = zonedWallTimeToUtc(z.year, z.month, z.day, 12, 0, 0, z.offsetMinutes);
  const targetDate = new Date(targetDayUtcNoon.getTime() + addDays * 86400000);
  const tz = zonedParts(targetDate, timeZone);
  const instant = zonedWallTimeToUtc(tz.year, tz.month, tz.day, hour, 0, 0, tz.offsetMinutes);

  const hh = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';

  return {
    date: instant,
    dateLabel: `${DAYS[tz.weekday].slice(0, 3)} ${tz.day} ${MONTHS[tz.month - 1]}`,
    timeLabel: `${hh}:00 ${ampm}`,
  };
}
