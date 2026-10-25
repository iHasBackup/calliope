import { useState, type ReactNode } from 'react';
import type { Content, ScheduleChangeType } from '../../content';
import { changeError, conflictError, hourLabel, type ChangeInput } from '../../schedule';
import { nextSession } from '../../time';
import { Panel, SectionHeader, SelectField, TextField, mutedInk } from '../fields';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HOURS = Array.from({ length: 24 }, (_, h) => ({
  value: String(h),
  label: hourLabel(h),
}));

const inputStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  width: '100%',
  height: 44,
  padding: '0 10px',
  background: 'var(--color-text)',
  color: 'var(--color-bg)',
  border: `1px solid ${mutedInk(22)}`,
  borderRadius: 0,
  fontFamily: 'var(--font-body)',
  fontSize: 16,
  lineHeight: 1,
  outline: 'none',
  colorScheme: 'dark',
};
const labelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 6,
  height: 16,
  whiteSpace: 'nowrap',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: mutedInk(65),
};
const hint = (t: string) => <span style={{ fontWeight: 500, letterSpacing: '0.04em', textTransform: 'none' }}>{t}</span>;

function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

// Lucide-style calendar icons, square caps and joins.
function CalIcon({ type }: { type: ScheduleChangeType }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" />
      <path d="M3 10h18" />
      {type === 'cancel' && (
        <>
          <path d="m14 14-4 4" />
          <path d="m10 14 4 4" />
        </>
      )}
      {type === 'move' && (
        <>
          <path d="M8 16h8" />
          <path d="m13 13 3 3-3 3" />
        </>
      )}
      {type === 'extra' && (
        <>
          <path d="M9 16h6" />
          <path d="M12 13v6" />
        </>
      )}
    </svg>
  );
}

const TILES: { type: ScheduleChangeType; title: string; desc: string }[] = [
  {
    type: 'cancel',
    title: 'Cancel a session',
    desc: 'Strike one night off. It stays on the calendar, crossed out.',
  },
  {
    type: 'move',
    title: 'Move a session',
    desc: 'Shift one night to another date or start time.',
  },
  {
    type: 'extra',
    title: 'Extra session',
    desc: 'Add a one-off night outside the weekly slot.',
  },
];
const HIST_PAGE = 5;
const HEADINGS: Record<ScheduleChangeType, string> = {
  cancel: 'Cancel a session',
  move: 'Move a session',
  extra: 'Add an extra session',
};
const TAGS: Record<string, [string, string]> = {
  cancel: ['var(--color-bg)', 'var(--color-text)'],
  move: ['var(--color-accent)', '#ffffff'],
  extra: ['var(--color-accent-200)', 'var(--color-accent-900)'],
  remove: [mutedInk(16), 'var(--color-bg)'],
};

interface Draft {
  type: ScheduleChangeType;
  date: string;
  toDate: string;
  toHour: string;
  note: string;
  err: string;
  busy: boolean;
}

function stamp(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function ScheduleSection({
  draft,
  update,
  width,
  submitChange,
  undoChange,
}: {
  draft: Content;
  update: (fn: (c: Content) => void) => void;
  width: number;
  submitChange: (change: ChangeInput) => Promise<string>;
  undoChange: (changeId: string) => Promise<string>;
}) {
  const wide = width >= 700;
  const sc = draft.schedule;
  const [form, setForm] = useState<Draft | null>(null);
  const [undoing, setUndoing] = useState('');
  const [undoErr, setUndoErr] = useState('');
  // History shows 5 rows a page; the page is clamped so it never points past the end.
  const [histPage, setHistPage] = useState(0);
  const histPages = Math.max(1, Math.ceil(sc.history.length / HIST_PAGE));
  const page = Math.min(histPage, histPages - 1);
  const histRows = sc.history.slice(page * HIST_PAGE, page * HIST_PAGE + HIST_PAGE);

  let preview = '';
  try {
    const s = nextSession(new Date(), sc.weekday, sc.hour, sc.timezone);
    preview = `${s.dateLabel} · ${s.timeLabel}${sc.label ? ` ${sc.label}` : ''}`;
  } catch {
    preview = 'Invalid timezone';
  }

  const open = (type: ScheduleChangeType) =>
    setForm({
      type,
      date: '',
      toDate: '',
      toHour: String(sc.hour),
      note: '',
      err: '',
      busy: false,
    });
  const set = (k: 'date' | 'toDate' | 'toHour' | 'note') => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const v = e.target.value;
    setForm((f) => (f ? { ...f, [k]: v, err: '' } : f));
  };
  const submit = async () => {
    if (!form || form.busy) return;
    const input: ChangeInput = {
      type: form.type,
      date: form.date,
      note: form.note,
    };
    if (form.type === 'move') input.toDate = form.toDate;
    if (form.type !== 'cancel') input.toHour = Number(form.toHour);
    const err = changeError(input) || conflictError(sc, input);
    if (err) return setForm({ ...form, err });
    setForm({ ...form, busy: true });
    const serverErr = await submitChange(input);
    if (serverErr) setForm((f) => (f ? { ...f, busy: false, err: serverErr } : f));
    else {
      setForm(null);
      setHistPage(0); // show the new row
    }
  };
  const undo = async (changeId: string) => {
    setUndoing(changeId);
    const err = await undoChange(changeId);
    setUndoErr(err);
    if (!err) setHistPage(0);
    setUndoing('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionHeader title="Schedule" description="Drives the next-session countdown and the calendar." />

      <Panel>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: wide ? 'repeat(3, minmax(0, 1fr))' : 'minmax(0, 1fr)',
            gap: 16,
            alignItems: 'end',
          }}
        >
          <SelectField
            label="Day"
            value={String(sc.weekday)}
            options={DAYS.map((d, i) => ({ value: String(i), label: d }))}
            onChange={(v) => update((c) => (c.schedule.weekday = Number(v)))}
          />
          <SelectField label="Start time" value={String(sc.hour)} options={HOURS} onChange={(v) => update((c) => (c.schedule.hour = Number(v)))} />
          <TextField label="Timezone label" placeholder="GMT+7" value={sc.label} onChange={(v) => update((c) => (c.schedule.label = v))} />
        </div>
        <TextField
          label="IANA timezone · drives the actual countdown math"
          placeholder="Asia/Jakarta"
          value={sc.timezone}
          onChange={(v) => update((c) => (c.schedule.timezone = v))}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 6,
            paddingTop: 14,
            borderTop: `1px solid ${mutedInk(14)}`,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-accent-400)',
            }}
          >
            Next session
          </span>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 20,
            }}
          >
            {preview}
          </span>
        </div>
      </Panel>

      <Panel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 18,
              textTransform: 'uppercase',
            }}
          >
            Calendar
          </span>
          <span style={{ fontSize: 14, color: mutedInk(65) }}>Shown on chocobie.site/calendar. Sessions are generated weekly from the first session date.</span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: wide ? 'minmax(0, 1fr) minmax(0, 1fr) minmax(120px, 160px)' : 'minmax(0, 1fr)',
            gap: 16,
            alignItems: 'end',
          }}
        >
          <Field label="First session">
            <input type="date" value={sc.start} style={inputStyle} onChange={(e) => update((c) => (c.schedule.start = e.target.value))} />
          </Field>
          <Field label={<>Last session {hint('optional')}</>}>
            <input type="date" value={sc.end} style={inputStyle} onChange={(e) => update((c) => (c.schedule.end = e.target.value))} />
          </Field>
          <Field label={<>Session length {hint('hours')}</>}>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={12}
              value={sc.duration}
              style={inputStyle}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                update((c) => (c.schedule.duration = Number.isNaN(n) ? 1 : Math.max(1, Math.min(12, n))));
              }}
            />
          </Field>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            paddingTop: 14,
            borderTop: `1px solid ${mutedInk(14)}`,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: mutedInk(65),
            }}
          >
            Change the schedule
          </span>
          {!form ? (
            <div className="admin-sched-tiles">
              <div className="admin-sched-tiles-grid">
                {TILES.map((t) => (
                  <button key={t.type} type="button" className="admin-sched-tile" onClick={() => open(t.type)}>
                    <span
                      style={{
                        flex: 'none',
                        color: 'var(--color-accent-400)',
                        display: 'flex',
                      }}
                    >
                      <CalIcon type={t.type} />
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 700,
                          fontSize: 14,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t.title}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          lineHeight: 1.4,
                          color: mutedInk(65),
                        }}
                      >
                        {t.desc}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                padding: 16,
                border: '2px solid var(--color-accent)',
              }}
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 16,
                  textTransform: 'uppercase',
                }}
              >
                {HEADINGS[form.type]}
              </span>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: wide ? 'repeat(3, minmax(0, 1fr))' : 'minmax(0, 1fr)',
                  gap: 12,
                  alignItems: 'end',
                }}
              >
                <Field label={form.type === 'extra' ? 'Date' : 'Session date'}>
                  <input type="date" value={form.date} style={inputStyle} onChange={set('date')} />
                </Field>
                {form.type === 'move' && (
                  <Field label="New date">
                    <input type="date" value={form.toDate} style={inputStyle} onChange={set('toDate')} />
                  </Field>
                )}
                {form.type !== 'cancel' && (
                  <Field label="Start time">
                    <select value={form.toHour} style={inputStyle} onChange={set('toHour')}>
                      {HOURS.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
              </div>
              <Field label="Note shown on the calendar">
                <input type="text" placeholder="e.g. DM is travelling" value={form.note} maxLength={200} style={inputStyle} onChange={set('note')} />
              </Field>
              {form.err && (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-accent-400)',
                  }}
                >
                  {form.err}
                </span>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="submit" className="admin-sched-submit" disabled={form.busy}>
                  {form.busy ? 'Saving…' : 'Submit →'}
                </button>
                <button type="button" className="admin-sched-cancel" onClick={() => setForm(null)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </Panel>

      <Panel>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 18,
              textTransform: 'uppercase',
            }}
          >
            History
          </span>
          <span style={{ fontSize: 13, color: mutedInk(60) }}>Submitted changes apply to the calendar right away</span>
        </div>
        {sc.history.length ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderTop: `1px solid ${mutedInk(14)}`,
            }}
          >
            {histRows.map((h) => {
              const [bg, fg] = TAGS[h.kind] ?? TAGS.remove;
              const active = !!h.changeId && sc.changes.some((x) => x.id === h.changeId);
              return (
                <div
                  key={h.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: wide ? '150px minmax(0, 1fr) auto' : 'minmax(0, 1fr) auto',
                    gap: '4px 16px',
                    alignItems: 'baseline',
                    padding: '12px 0',
                    borderBottom: `1px solid ${mutedInk(10)}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: mutedInk(60),
                      fontVariantNumeric: 'tabular-nums',
                      gridColumn: wide ? undefined : '1 / -1',
                    }}
                  >
                    {stamp(h.at)}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'baseline',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          padding: '3px 7px',
                          background: bg,
                          color: fg,
                        }}
                      >
                        {h.action}
                      </span>
                      <span style={{ fontSize: 15 }}>{h.detail}</span>
                    </span>
                    {h.note && <span style={{ fontSize: 13, color: mutedInk(65) }}>{h.note}</span>}
                  </span>
                  {active ? (
                    <button type="button" className="admin-sched-undo" disabled={undoing === h.changeId} onClick={() => undo(h.changeId!)}>
                      {undoing === h.changeId ? 'Undoing…' : 'Undo'}
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <span style={{ fontSize: 14, color: mutedInk(60) }}>No schedule changes yet.</span>
        )}
        {sc.history.length > HIST_PAGE && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: mutedInk(60), fontVariantNumeric: 'tabular-nums' }}>
              {page * HIST_PAGE + 1}–{Math.min(sc.history.length, page * HIST_PAGE + HIST_PAGE)} of {sc.history.length}
            </span>
            <nav aria-label="History pages" style={{ display: 'flex', gap: 2 }}>
              <button type="button" className="admin-pager-btn" aria-label="Previous page" disabled={page === 0} onClick={() => setHistPage(page - 1)}>
                ←
              </button>
              {Array.from({ length: histPages }, (_, i) => (
                <button key={i} type="button" className="admin-pager-btn" aria-current={i === page ? 'page' : undefined} onClick={() => setHistPage(i)}>
                  {i + 1}
                </button>
              ))}
              <button type="button" className="admin-pager-btn" aria-label="Next page" disabled={page >= histPages - 1} onClick={() => setHistPage(page + 1)}>
                →
              </button>
            </nav>
          </div>
        )}
        {undoErr && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-accent-400)',
            }}
          >
            {undoErr}
          </span>
        )}
      </Panel>
    </div>
  );
}
