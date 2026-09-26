import type { useCampaignSite } from './useCampaignSite';

type Props = Pick<ReturnType<typeof useCampaignSite>, 'openRecap' | 'setOpenRecap' | 'content'>;

const mutedInk = (pct: number) => `color-mix(in srgb, var(--color-bg) ${pct}%, transparent)`;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function RecapsTab({ openRecap, setOpenRecap, content }: Props) {
  const byDate = content.recaps.slice().sort((a, b) => a.date.localeCompare(b.date));
  const rows = byDate
    .map((r, i) => {
      const no = i + 1;
      const d = r.date ? new Date(r.date + 'T12:00:00') : null;
      const open = openRecap === r.id;
      const latest = no === byDate.length;
      const tags = r.tags.split(',').map((t) => t.trim()).filter(Boolean);
      return { ...r, no, open, latest, d, tags };
    })
    .reverse();

  return (
    <div style={{ padding: 'clamp(36px, 6vw, 72px) clamp(16px, 4vw, 48px)', display: 'flex', flexDirection: 'column', gap: 36, maxWidth: 900 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent-400)' }}>
          {content.recaps.length} sessions &middot; {String(content.nights).padStart(2, '0')} nights
        </span>
        <h1 style={{ margin: 0, fontSize: 'clamp(40px, 7vw, 88px)', lineHeight: 0.9, letterSpacing: '-0.035em', textTransform: 'uppercase' }}>
          Session recaps
        </h1>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((r) => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '20px minmax(0, 1fr)', gap: '0 clamp(10px, 2.5vw, 18px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  marginTop: 26,
                  transform: 'rotate(45deg)',
                  background: r.latest ? 'var(--color-accent)' : 'var(--color-text)',
                  border: `2px solid ${r.latest ? 'var(--color-accent)' : mutedInk(50)}`,
                  flex: 'none',
                }}
              />
              <div style={{ flex: 1, width: 2, background: mutedInk(18) }} />
            </div>
            <div style={{ paddingBottom: 14 }}>
              <div
                style={{
                  background: r.open ? 'var(--panel)' : 'transparent',
                  border: `1px solid ${r.open ? mutedInk(20) : mutedInk(10)}`,
                }}
              >
                <button
                  type="button"
                  style={{
                    all: 'unset',
                    boxSizing: 'border-box',
                    width: '100%',
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                    gap: 16,
                    alignItems: 'center',
                    padding: '16px clamp(14px, 3vw, 18px)',
                    minHeight: 44,
                  }}
                  onClick={() => setOpenRecap(r.open ? '' : r.id)}
                >
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                    <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 12, letterSpacing: '0.1em', color: 'var(--color-accent-400)' }}>
                        SESSION {String(r.no).padStart(2, '0')}
                      </span>
                      <span style={{ fontSize: 12, color: mutedInk(60) }}>
                        {r.d ? `${DAYS[r.d.getDay()]} ${r.d.getDate()} ${MONTHS[r.d.getMonth()]}` : 'No date'}
                        {r.nights ? ` · Night ${r.nights}` : ''}
                      </span>
                      {r.latest && (
                        <span style={{ background: 'var(--color-accent)', color: '#ffffff', padding: '2px 6px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>
                          LATEST
                        </span>
                      )}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 800,
                        fontSize: 'clamp(18px, 2.4vw, 24px)',
                        lineHeight: 1.1,
                        textTransform: 'uppercase',
                        textWrap: 'pretty',
                      }}
                    >
                      {r.title || 'Untitled session'}
                    </span>
                  </span>
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      flex: 'none',
                      display: 'grid',
                      placeItems: 'center',
                      border: `1px solid ${mutedInk(30)}`,
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 800,
                      fontSize: 18,
                    }}
                  >
                    {r.open ? '−' : '+'}
                  </span>
                </button>
                {r.open && (
                  <div style={{ padding: '0 clamp(14px, 3vw, 18px) 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: mutedInk(85), maxWidth: 620, textWrap: 'pretty' }}>{r.body}</p>
                    {r.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {r.tags.map((tag) => (
                          <span key={tag} style={{ border: `1px solid ${mutedInk(35)}`, padding: '3px 8px', fontSize: 12 }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
