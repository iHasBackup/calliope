import type { Content, Recap } from '../../content';
import { FieldRow, OutlineAddButton, SectionHeader, TextAreaField, TextField, mutedInk } from '../fields';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function RecapsSection({
  draft,
  update,
  openRecap,
  setOpenRecap,
  addRecap,
  removeRecap,
}: {
  draft: Content;
  update: (fn: (c: Content) => void) => void;
  openRecap: string;
  setOpenRecap: (id: string) => void;
  addRecap: () => void;
  removeRecap: (i: number, recap: Recap) => void;
}) {
  const byDate = draft.recaps
    .map((r, i) => ({ r, i }))
    .sort((a, b) => (a.r.date || '').localeCompare(b.r.date || ''));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionHeader title="Recaps" description="Numbered by date. Newest first." action={<OutlineAddButton label="+ New recap" onClick={addRecap} />} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {byDate
          .map(({ r, i }, k) => {
            const open = openRecap === r.id;
            const d = r.date ? new Date(r.date + 'T12:00:00') : null;
            const meta = (d ? `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : 'No date') + (r.nights ? ` · Night ${r.nights}` : '');
            return { r, i, no: k + 1, open, meta };
          })
          .reverse()
          .map(({ r, i, no, open, meta }) => (
            <div key={r.id} style={{ background: open ? 'var(--panel)' : 'transparent', border: `1px solid ${mutedInk(open ? 20 : 12)}` }}>
              <button
                type="button"
                style={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  width: '100%',
                  cursor: 'pointer',
                  display: 'grid',
                  gridTemplateColumns: '44px minmax(0, 1fr) 32px',
                  gap: 12,
                  alignItems: 'center',
                  padding: '12px clamp(12px, 3vw, 18px)',
                  minHeight: 56,
                }}
                onClick={() => setOpenRecap(open ? '' : r.id)}
              >
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', color: 'var(--color-accent-400)' }}>
                  S{String(no).padStart(2, '0')}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 800,
                      fontSize: 16,
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {r.title || 'Untitled session'}
                  </span>
                  <span style={{ fontSize: 12, color: mutedInk(60) }}>{meta}</span>
                </span>
                <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', border: `1px solid ${mutedInk(30)}`, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18 }}>
                  {open ? '−' : '+'}
                </span>
              </button>
              {open && (
                <div style={{ padding: '4px clamp(12px, 3vw, 18px) 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <TextField label="Title" value={r.title} onChange={(v) => update((c) => (c.recaps[i].title = v))} />
                  <FieldRow>
                    <TextField label="Session date" type="date" value={r.date} onChange={(v) => update((c) => (c.recaps[i].date = v))} />
                    <TextField label="In-game night(s)" placeholder="e.g. 9 or 9-10" value={r.nights} onChange={(v) => update((c) => (c.recaps[i].nights = v))} />
                  </FieldRow>
                  <TextAreaField label="What happened" rows={5} value={r.body} onChange={(v) => update((c) => (c.recaps[i].body = v))} />
                  <TextField label="Tags · comma separated" placeholder="Church, Curse" value={r.tags} onChange={(v) => update((c) => (c.recaps[i].tags = v))} />
                  <button
                    type="button"
                    className="admin-text-link"
                    style={{ all: 'unset', cursor: 'pointer', alignSelf: 'flex-start', minHeight: 32, fontSize: 13, color: 'var(--color-accent-400)' }}
                    onClick={() => removeRecap(i, r)}
                  >
                    Delete this recap
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
