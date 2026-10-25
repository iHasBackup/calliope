import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../campaign/useContent';
import { useDarkBody } from '../campaign/useDarkBody';
import { addDays, campaignFromContent, pad, registrationOpen, sessionsOf, toIcs, weekdayOf, type CalendarCampaign, type CalendarSession, type Tone } from '../campaign/schedule';
import { todayIn } from '../campaign/time';
import './calendar.css';

type View = 'week' | 'month' | 'agenda' | 'year';
const VIEWS: [View, string][] = [
  ['week', 'Week'],
  ['month', 'Month'],
  ['agenda', 'Agenda'],
  ['year', 'Year'],
];
const VIEW_KEY = 'chocobie-calendar-view';
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WDF = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ROW = 52;
const MUTED = 'color-mix(in srgb, var(--color-bg) 60%, transparent)';

const TONES: Record<Tone, { bg: string; fg: string; border: string; dot: string }> = {
  accent: { bg: 'var(--color-accent)', fg: '#ffffff', border: 'var(--color-accent)', dot: 'var(--color-accent)' },
  ash: { bg: 'var(--color-accent-900)', fg: 'var(--color-accent-100)', border: 'var(--color-accent-400)', dot: 'var(--color-accent-400)' },
  stone: {
    bg: 'color-mix(in srgb, var(--color-bg) 24%, var(--color-text))',
    fg: 'var(--color-bg)',
    border: 'color-mix(in srgb, var(--color-bg) 45%, transparent)',
    dot: 'color-mix(in srgb, var(--color-bg) 60%, var(--color-text))',
  },
};

const hm = (h: number) => `${pad(Math.floor(h) % 24)}:${pad(Math.round((h % 1) * 60))}`;
const range = (s: CalendarSession) => `${hm(s.hour)}–${hm(s.hour + s.duration)}`;
const dmy = (s: string) => `${+s.slice(8)} ${MON[+s.slice(5, 7) - 1]}`;
const monday = (s: string) => addDays(s, -((weekdayOf(s) + 6) % 7));

/** Hours since midnight, as the clock reads in `timeZone`. */
function hoursIn(timeZone: string, now: number) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(now));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return get('hour') + get('minute') / 60;
}

function download(name: string, text: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/calendar' }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function readView(): View {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    if (v === 'week' || v === 'month' || v === 'agenda' || v === 'year') return v;
  } catch {
    /* storage unavailable */
  }
  return 'week';
}

function useNow(ms: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

function useWidth() {
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

function Skeleton() {
  return (
    <div className="cal-skel" aria-busy="true" aria-label="Loading calendar">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 280, background: 'none' }}>
        <div style={{ height: 120 }} />
        <div style={{ height: 56 }} />
        <div style={{ height: 56 }} />
        <div style={{ height: 56 }} />
      </div>
      <div style={{ gridColumn: 'span 3', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12, background: 'none' }}>
        <div style={{ height: 44 }} />
        <div style={{ height: 520 }} />
      </div>
    </div>
  );
}

export default function CalendarPage({ showSkeleton = false }: { showSkeleton?: boolean }) {
  useDarkBody();
  const { content, loading, error } = useContent();
  const now = useNow(30000);
  const w = useWidth();
  const wide = w >= 1024;
  const mid = w >= 760;

  const [view, setViewState] = useState<View>(readView);
  const [cursor, setCursor] = useState('');
  const [sel, setSel] = useState<string | null>(null);
  const [mDay, setMDay] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Calendar · Chocobie';
  }, []);

  // Every campaign on the calendar. Today there is one; more slot in here.
  const camps = useMemo<CalendarCampaign[]>(() => {
    if (loading || error) return [];
    const tcm = campaignFromContent(content, {
      id: 'tcm',
      title: 'The Crooked Moon',
      homeUrl: '/thecrookedmoon',
      registerUrl: '/thecrookedmoon/apply',
      registrationOpen: registrationOpen(content),
    });
    return tcm ? [tcm] : [];
  }, [content, loading, error]);
  const tz = camps[0]?.timeZone ?? content.schedule.timezone;
  const today = todayIn(tz, new Date(now));
  const cur = cursor || today;

  const sessOf = useMemo(() => new Map(camps.map((c) => [c.id, sessionsOf(c)])), [camps]);
  const byId = useMemo(() => new Map(camps.map((c) => [c.id, c])), [camps]);
  const all = useMemo(() => [...sessOf.values()].flat().sort((a, b) => a.startMs - b.startMs), [sessOf]);
  const byDay = useMemo(() => {
    const m = new Map<string, CalendarSession[]>();
    all.forEach((x) => m.set(x.date, [...(m.get(x.date) ?? []), x]));
    return m;
  }, [all]);

  useEffect(() => {
    if (!sel) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSel(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sel]);

  const setView = (v: View) => {
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* storage unavailable */
    }
    setViewState(v);
    setMDay(null);
  };
  const shift = (dir: number) => {
    let c = cur;
    if (view === 'week') c = addDays(c, 7 * dir);
    else if (view === 'agenda') c = addDays(c, 28 * dir);
    else {
      let y = +c.slice(0, 4);
      let m = +c.slice(5, 7);
      if (view === 'year') y += dir;
      else {
        m += dir;
        if (m < 1) [m, y] = [12, y - 1];
        if (m > 12) [m, y] = [1, y + 1];
      }
      c = `${y}-${pad(m)}-01`;
    }
    setCursor(c);
    setMDay(null);
  };

  const status = (x: CalendarSession): [string, string, string] => {
    if (x.cancelled) return ['Cancelled', 'transparent', MUTED];
    if (x.startMs <= now && now <= x.endMs) return ['Playing now', 'var(--color-accent)', '#ffffff'];
    if (x.endMs < now) return ['Played', 'color-mix(in srgb, var(--color-bg) 14%, transparent)', 'var(--color-bg)'];
    if (x.date === today) return ['Tonight', 'var(--color-accent)', '#ffffff'];
    return [x.movedFrom ? 'Moved' : x.extra ? 'Extra' : 'Upcoming', 'var(--color-bg)', 'var(--color-text)'];
  };
  const look = (x: CalendarSession) => {
    const t = TONES[byId.get(x.campId)?.tone ?? 'stone'];
    const past = x.endMs < now;
    return {
      dot: t.dot,
      style: {
        background: x.cancelled ? 'transparent' : past ? `color-mix(in srgb, ${t.bg} 45%, var(--color-text))` : t.bg,
        color: x.cancelled ? MUTED : t.fg,
        border: x.cancelled ? `1px dashed ${t.border}` : `1px solid ${past ? 'transparent' : t.border}`,
      } as React.CSSProperties,
      deco: (x.cancelled ? 'line-through' : 'none') as React.CSSProperties['textDecoration'],
    };
  };
  const camp = (x: CalendarSession) => byId.get(x.campId)?.title ?? '';
  const open = (x: CalendarSession) => (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSel(x.id);
  };

  const DayHead = ({ d }: { d: string }) => (
    <>
      <span className={`cal-day-wd${d === today ? ' is-today' : ''}`}>{WD[weekdayOf(d)].toUpperCase()}</span>
      <span className={`cal-day-num${d === today ? ' is-today' : ''}`}>{+d.slice(8)}</span>
    </>
  );
  const Card = ({ x }: { x: CalendarSession }) => {
    const l = look(x);
    return (
      <button type="button" className="cal-card" style={l.style} onClick={open(x)}>
        <span className="cal-ev-range">{range(x)}</span>
        <span className="cal-ev-camp" style={{ textDecoration: l.deco }}>
          {camp(x)}
        </span>
        <span className="cal-ev-title" style={{ textDecoration: l.deco }}>
          {x.title}
        </span>
      </button>
    );
  };

  // ---- next session ----
  const nx = all.find((x) => !x.cancelled && x.endMs > now);
  let nextBar = null;
  if (nx) {
    const live = nx.startMs <= now;
    const diff = nx.startMs - now;
    const dd = Math.floor(diff / 864e5);
    const hh = Math.floor((diff % 864e5) / 36e5);
    const mm = Math.floor((diff % 36e5) / 6e4);
    const rel = live ? 'Playing now' : dd > 1 ? `in ${dd} days` : dd === 1 ? 'tomorrow' : hh > 0 ? `in ${hh} ${hh === 1 ? 'hour' : 'hours'}` : `in ${Math.max(1, mm)} min`;
    const c = byId.get(nx.campId)!;
    nextBar = (
      <button type="button" className="cal-next" onClick={open(nx)}>
        <span className="cal-next-kicker">{live ? 'At the table now' : nx.date === today ? 'Tonight' : 'Next session'}</span>
        <span className="cal-heading cal-next-camp">{c.title}</span>
        <span style={{ fontSize: 14, fontWeight: 500 }}>
          Session {pad(nx.n)}
          {nx.recap ? ` · ${nx.title}` : ''}
        </span>
        <span style={{ fontSize: 14 }}>
          {WD[weekdayOf(nx.date)]} {dmy(nx.date)}, {range(nx)}
          {c.tzLabel ? ` ${c.tzLabel}` : ''}
        </span>
        <span className="cal-next-rel">
          <span>{rel}</span>
          <span style={{ fontSize: 18 }} aria-hidden="true">
            &rarr;
          </span>
        </span>
      </button>
    );
  }

  // ---- the hour span of the week grid ----
  let H0 = 24;
  let H1 = 0;
  all.forEach((x) => {
    H0 = Math.min(H0, x.hour);
    H1 = Math.max(H1, x.hour + x.duration);
  });
  if (H0 > H1) [H0, H1] = [17, 23];
  H0 = Math.max(0, Math.floor(H0) - 1);
  H1 = Math.min(24, Math.ceil(H1) + 1);
  const nowH = hoursIn(tz, now);

  let title = '';
  let body: React.ReactNode = null;

  if (view === 'week') {
    const w0 = monday(cur);
    const w6 = addDays(w0, 6);
    title = w0.slice(5, 7) === w6.slice(5, 7) ? `${+w0.slice(8)} – ${dmy(w6)} ${w6.slice(0, 4)}` : `${dmy(w0)} – ${dmy(w6)} ${w6.slice(0, 4)}`;
    const days = Array.from({ length: 7 }, (_, i) => addDays(w0, i));
    const empty = days.every((d) => !(byDay.get(d) ?? []).length);
    if (mid) {
      const gridH = (H1 - H0) * ROW;
      body = (
        <div className="cal-frame">
          <div className="cal-wk-head">
            <div />
            {days.map((d) => (
              <div key={d}>
                <DayHead d={d} />
              </div>
            ))}
          </div>
          <div className="cal-wk-grid">
            <div>
              {Array.from({ length: H1 - H0 }, (_, i) => (
                <div key={i} className="cal-hour">
                  {hm(H0 + i)}
                </div>
              ))}
            </div>
            {days.map((d) => {
              const list = byDay.get(d) ?? [];
              const ends: number[] = [];
              const placed = list.map((x) => {
                let lane = ends.findIndex((e) => e <= x.hour);
                if (lane < 0) {
                  lane = ends.length;
                  ends.push(0);
                }
                ends[lane] = x.hour + x.duration;
                return { x, lane };
              });
              const lanes = Math.max(1, ends.length);
              return (
                <div key={d} className={`cal-col${d === today ? ' is-today' : ''}`} style={{ height: gridH }}>
                  {placed.map(({ x, lane }) => {
                    const l = look(x);
                    return (
                      <button
                        key={x.id}
                        type="button"
                        className="cal-ev"
                        style={{
                          ...l.style,
                          top: (x.hour - H0) * ROW + 2,
                          height: Math.max(ROW - 4, (Math.min(H1, x.hour + x.duration) - x.hour) * ROW - 4),
                          left: `calc(${(lane * 100) / lanes}% + 3px)`,
                          width: `calc(${100 / lanes}% - 6px)`,
                        }}
                        onClick={open(x)}
                      >
                        <span className="cal-ev-range">{range(x)}</span>
                        <span className="cal-ev-camp" style={{ textDecoration: l.deco }}>
                          {camp(x)}
                        </span>
                        <span className="cal-ev-title" style={{ textDecoration: l.deco }}>
                          {x.title}
                        </span>
                      </button>
                    );
                  })}
                  {d === today && nowH >= H0 && nowH <= H1 && <div className="cal-now" style={{ top: (nowH - H0) * ROW - 1 }} />}
                </div>
              );
            })}
          </div>
          {empty && <p className="cal-empty">No sessions this week. The table rests.</p>}
        </div>
      );
    } else {
      body = (
        <div className="cal-frame">
          {days.map((d) => {
            const list = byDay.get(d) ?? [];
            return (
              <div key={d} className="cal-wk-day">
                <div>
                  <DayHead d={d} />
                </div>
                <div>
                  {list.map((x) => (
                    <Card key={x.id} x={x} />
                  ))}
                  {!list.length && <span className="cal-nothing">Nothing scheduled</span>}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
  } else if (view === 'month') {
    const y = +cur.slice(0, 4);
    const m = +cur.slice(5, 7);
    title = `${MONTHS[m - 1]} ${y}`;
    const first = `${y}-${pad(m)}-01`;
    const last = `${y}-${pad(m)}-${pad(new Date(Date.UTC(y, m, 0)).getUTCDate())}`;
    const end = addDays(monday(last), 6);
    const rows: string[] = [];
    for (let r = monday(first); r <= end; r = addDays(r, 7)) rows.push(r);
    const pick = mDay ? (byDay.get(mDay) ?? []) : [];
    body = (
      <div className="cal-frame">
        <div className="cal-mo-row cal-mo-head">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
        {rows.map((r) => (
          <div key={r} className="cal-mo-row">
            {Array.from({ length: 7 }, (_, i) => {
              const d = addDays(r, i);
              const list = byDay.get(d) ?? [];
              const inM = d.slice(5, 7) === pad(m);
              const num = <span className={`cal-mo-num${d === today ? ' is-today' : inM ? '' : ' is-out'}`}>{+d.slice(8)}</span>;
              if (wide) {
                return (
                  <div key={d} className="cal-mo-cell" style={{ minHeight: 112 }}>
                    {num}
                    {list.slice(0, 3).map((x) => {
                      const l = look(x);
                      return (
                        <button key={x.id} type="button" className="cal-chip" style={l.style} onClick={open(x)}>
                          <span style={{ flex: 'none' }}>{hm(x.hour)}</span>
                          <span style={{ textDecoration: l.deco }}>{camp(x)}</span>
                        </button>
                      );
                    })}
                    {list.length > 3 && (
                      <button
                        type="button"
                        className="cal-more"
                        onClick={() => {
                          setViewState('week');
                          setCursor(d);
                        }}
                      >
                        +{list.length - 3} more
                      </button>
                    )}
                  </div>
                );
              }
              return (
                <button
                  key={d}
                  type="button"
                  className="cal-mo-cell"
                  aria-pressed={mDay === d}
                  aria-label={`${WDF[weekdayOf(d)]} ${dmy(d)}, ${list.length ? `${list.length} session${list.length > 1 ? 's' : ''}` : 'nothing scheduled'}`}
                  style={{ minHeight: 64, background: mDay === d ? 'color-mix(in srgb, var(--color-bg) 12%, var(--color-text))' : 'transparent' }}
                  onClick={() => setMDay(mDay === d ? null : d)}
                >
                  {num}
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {list.map((x) => {
                      const l = look(x);
                      return <span key={x.id} className="cal-bar" style={{ background: l.style.background, border: l.style.border }} />;
                    })}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
        {!wide && mDay && (
          <div className="cal-pick">
            <span className="cal-label">
              {WDF[weekdayOf(mDay)]} {dmy(mDay)}
            </span>
            {pick.map((x) => (
              <Card key={x.id} x={x} />
            ))}
            {!pick.length && <span className="cal-nothing" style={{ fontSize: 14 }}>Nothing scheduled.</span>}
          </div>
        )}
      </div>
    );
  } else if (view === 'agenda') {
    const endD = addDays(cur, 55);
    title = `From ${dmy(cur)} ${cur.slice(0, 4)}`;
    const days = [...byDay.keys()].filter((d) => d >= cur && d <= endD).sort();
    let lastM = '';
    body = (
      <div className="cal-frame">
        {days.map((d) => {
          const mk = d.slice(0, 7);
          const head = mk !== lastM;
          lastM = mk;
          return (
            <div key={d}>
              {head && <div className="cal-ag-month">{`${MONTHS[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}`}</div>}
              <div className="cal-ag-day">
                <div>
                  <DayHead d={d} />
                </div>
                <div>
                  {(byDay.get(d) ?? []).map((x) => {
                    const l = look(x);
                    const st = status(x);
                    return (
                      <button key={x.id} type="button" className="cal-ag-ev" onClick={open(x)}>
                        <span className="cal-dot" style={{ background: l.dot }} />
                        <span className="cal-ev-range">{range(x)}</span>
                        <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                          <span className="cal-ev-camp" style={{ textDecoration: l.deco }}>
                            {camp(x)}
                          </span>
                          <span className="cal-ev-title" style={{ textDecoration: l.deco }}>
                            {x.title}
                          </span>
                        </span>
                        <span className="cal-tag" style={{ background: st[1], color: st[2] }}>
                          {st[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        {!days.length && <p className="cal-empty" style={{ fontSize: 15, padding: '20px 0', borderTop: 0 }}>Nothing on the calendar in this stretch.</p>}
      </div>
    );
  } else {
    const y = +cur.slice(0, 4);
    title = String(y);
    body = (
      <div className="cal-frame cal-yr">
        {MONTHS.map((name, mi) => {
          const first = `${y}-${pad(mi + 1)}-01`;
          const n = new Date(Date.UTC(y, mi + 1, 0)).getUTCDate();
          const lead = (weekdayOf(first) + 6) % 7;
          let count = 0;
          const cells = Array.from({ length: n }, (_, i) => {
            const d = `${y}-${pad(mi + 1)}-${pad(i + 1)}`;
            const list = (byDay.get(d) ?? []).filter((x) => !x.cancelled);
            count += list.length;
            const t = list.length ? TONES[byId.get(list[0].campId)?.tone ?? 'stone'] : null;
            return (
              <span
                key={d}
                style={{
                  background: t ? t.bg : 'transparent',
                  color: t ? t.fg : 'color-mix(in srgb, var(--color-bg) 70%, transparent)',
                  border: d === today ? '2px solid var(--color-bg)' : 0,
                }}
              >
                {i + 1}
              </span>
            );
          });
          return (
            <div key={first} className="cal-yr-month">
              <button
                type="button"
                className="cal-yr-name"
                onClick={() => {
                  setViewState('month');
                  setCursor(first);
                }}
              >
                <span>{name}</span>
                <span>{count ? `${count} ${count === 1 ? 'session' : 'sessions'}` : ''}</span>
              </button>
              <div className="cal-yr-grid">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((h, i) => (
                  <span key={i} className="is-head">
                    {h}
                  </span>
                ))}
                {Array.from({ length: lead }, (_, i) => (
                  <span key={`b${i}`} />
                ))}
                {cells}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ---- session detail ----
  let drawer = null;
  const x = sel ? all.find((s) => s.id === sel) : undefined;
  const c = x ? byId.get(x.campId) : undefined;
  if (x && c) {
    const list = sessOf.get(c.id) ?? [];
    const t = TONES[c.tone];
    const st = status(x);
    const upcoming = !x.cancelled && x.endMs > now;
    const future = list.filter((y) => !y.cancelled && y.endMs > now).slice(0, 60);
    const played = list.filter((y) => !y.cancelled && y.endMs < now);
    const isLast = played.length > 0 && played[played.length - 1].id === x.id;
    const slug = c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const tags = x.recap?.tags ? x.recap.tags.split(',').map((v) => v.trim()).filter(Boolean) : [];
    drawer = (
      <div className="cal-backdrop" onClick={() => setSel(null)}>
        <div className="cal-drawer" role="dialog" aria-modal="true" aria-label={x.title} onClick={(e) => e.stopPropagation()}>
          <div className="cal-dr-head">
            <span>
              <span className="cal-dot" style={{ background: t.dot }} />
              {c.title}
            </span>
            <button type="button" className="cal-close" aria-label="Close" autoFocus onClick={() => setSel(null)}>
              &times;
            </button>
          </div>
          <div className="cal-dr-body">
            <div className="cal-dr-main">
              <span style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="cal-label">{x.cancelled ? 'Cancelled session' : `${x.extra ? 'Extra session · ' : 'Session '}${pad(x.n)}`}</span>
                <span
                  className="cal-tag"
                  style={{
                    background: st[1] === 'transparent' ? 'color-mix(in srgb, var(--color-bg) 14%, transparent)' : st[1],
                    color: st[2] === MUTED ? 'var(--color-bg)' : st[2],
                  }}
                >
                  {st[0]}
                </span>
              </span>
              <h3 className="cal-heading cal-dr-title" style={{ textDecoration: x.cancelled ? 'line-through' : 'none' }}>
                {x.title}
              </h3>
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                {WDF[weekdayOf(x.date)]} {+x.date.slice(8)} {MONTHS[+x.date.slice(5, 7) - 1]} {x.date.slice(0, 4)}
              </span>
              <span style={{ fontSize: 14, color: 'color-mix(in srgb, var(--color-bg) 70%, transparent)' }}>
                {range(x)}
                {c.tzLabel ? ` ${c.tzLabel}` : ''}
                {c.system ? ` · ${c.system}` : ''}
              </span>
              {x.movedFrom && (
                <span style={{ fontSize: 14, color: 'var(--color-accent-300)' }}>
                  Moved from {WD[weekdayOf(x.movedFrom)]} {dmy(x.movedFrom)}
                </span>
              )}
              {x.note && <span style={{ fontSize: 14, lineHeight: 1.45, color: 'color-mix(in srgb, var(--color-bg) 80%, transparent)' }}>{x.note}</span>}
            </div>

            {isLast &&
              (x.recap?.body ? (
                <div className="cal-dr-block">
                  <span className="cal-label" style={{ color: 'var(--color-accent-300)' }}>
                    Last session recap
                  </span>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, textWrap: 'pretty', whiteSpace: 'pre-line' }}>{x.recap.body}</p>
                  {tags.length > 0 && (
                    <div className="cal-tags">
                      {tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="cal-dr-block" style={{ margin: 0, fontSize: 14, color: MUTED }}>
                  No recap posted yet.
                </p>
              ))}

            {c.party.length > 0 && (
              <div className="cal-dr-block" style={{ gap: 0 }}>
                <span className="cal-label" style={{ paddingBottom: 10 }}>
                  Party · {c.party.length}
                </span>
                <div className="cal-dr-party">
                  {c.party.map((p) => (
                    <div key={p.name} className="cal-dr-member">
                      <span>{p.name.charAt(0).toUpperCase()}</span>
                      <span>
                        <strong>{p.name}</strong>
                        <small>{p.klass}</small>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {upcoming && c.openSeats > 0 && (
              <div className="cal-dr-seat">
                <span className="cal-heading" style={{ fontSize: 18 }}>
                  {c.openSeats} {c.openSeats === 1 ? 'seat' : 'seats'} open at the table
                </span>
                {c.registerUrl ? (
                  <Link className="cal-apply" to={c.registerUrl}>
                    Apply for the seat <span aria-hidden="true">&rarr;</span>
                  </Link>
                ) : (
                  <span style={{ fontSize: 13, color: 'color-mix(in srgb, var(--color-bg) 65%, transparent)' }}>Registration is not open yet.</span>
                )}
              </div>
            )}

            <div className="cal-dr-block">
              {upcoming && (
                <button type="button" className="cal-action is-primary" onClick={() => download(`${slug}-session-${x.n}.ics`, toIcs(c, [x]))}>
                  Add this session to my calendar <span>.ics</span>
                </button>
              )}
              {future.length > 1 && (
                <button type="button" className="cal-action" onClick={() => download(`${slug}.ics`, toIcs(c, future))}>
                  Add all upcoming sessions <span>.ics</span>
                </button>
              )}
              {c.homeUrl && (
                <Link className="cal-action is-link" to={c.homeUrl}>
                  Campaign home <span aria-hidden="true">&rarr;</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isLoading = loading || showSkeleton;

  return (
    <div className="cal">
      <header className="cal-top">
        <div className="cal-mark">
          <div className="cal-mark-c" aria-hidden="true">
            C
          </div>
          <div className="cal-mark-name">Chocobie</div>
        </div>
        <Link className="cal-home" to="/thecrookedmoon">
          The Crooked Moon <span aria-hidden="true">&rarr;</span>
        </Link>
      </header>
      <h1 className="cal-heading cal-title">Calendar</h1>

      {isLoading ? (
        <Skeleton />
      ) : (
        <div className="cal-body">
          {error && <p className="cal-empty" style={{ borderTop: 0 }}>Could not load the schedule. Refresh to try again.</p>}
          {nextBar}
          <div className="cal-toolbar">
            <h2 className="cal-heading cal-period">{title}</h2>
            <div className="cal-nav">
              <button
                type="button"
                className="cal-today"
                onClick={() => {
                  setCursor(today);
                  setMDay(null);
                }}
              >
                Today
              </button>
              <button type="button" className="cal-arrow" aria-label="Previous" onClick={() => shift(-1)}>
                &larr;
              </button>
              <button type="button" className="cal-arrow" aria-label="Next" onClick={() => shift(1)}>
                &rarr;
              </button>
            </div>
            <div className="cal-views" role="tablist" aria-label="Calendar view">
              {VIEWS.map(([k, label]) => (
                <button key={k} type="button" role="tab" className="cal-view" aria-selected={view === k} onClick={() => setView(k)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {body}
        </div>
      )}
      {drawer}
    </div>
  );
}
