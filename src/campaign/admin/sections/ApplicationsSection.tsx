import { Link } from 'react-router-dom';
import type { Content } from '../../content';
import type { Application, ApplicationStatus } from '../../application';
import { classOf, speciesOf, summarize } from '../../registrationData';
import { SectionHeader, mutedInk } from '../fields';

const STATUSES: { v: ApplicationStatus; label: string }[] = [
  { v: 'new', label: 'New' },
  { v: 'shortlisted', label: 'Shortlisted' },
  { v: 'accepted', label: 'Accepted' },
  { v: 'declined', label: 'Declined' },
];

const ST_COLORS: Record<ApplicationStatus, [string, string, string]> = {
  new: ['var(--color-accent)', '#ffffff', 'var(--color-accent)'],
  shortlisted: ['var(--color-bg)', 'var(--color-text)', 'var(--color-bg)'],
  accepted: ['transparent', 'var(--color-accent-400)', 'var(--color-accent)'],
  declined: ['transparent', mutedInk(55), mutedInk(30)],
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function ApplicationsSection({
  draft,
  apps,
  openApp,
  setOpenApp,
  changeStatus,
  deleteApplication,
}: {
  draft: Content;
  apps: Application[];
  openApp: string;
  setOpenApp: (id: string) => void;
  changeStatus: (app: Application, status: ApplicationStatus) => void;
  deleteApplication: (app: Application) => void;
}) {
  const newCount = apps.filter((a) => !a.status || a.status === 'new').length;
  const sorted = apps.slice().sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionHeader
        title="Applications"
        description={`${apps.length} ${apps.length === 1 ? 'application' : 'applications'} · ${newCount} new. Status changes save immediately.`}
      />

      {apps.length === 0 && (
        <div style={{ background: 'var(--panel)', padding: 'clamp(16px, 3vw, 24px)', fontSize: 15, lineHeight: 1.55, color: mutedInk(70) }}>
          No applications yet. Share the{' '}
          <Link to="/thecrookedmoon/apply" style={{ color: 'var(--color-accent-400)' }}>
            registration page
          </Link>{' '}
          link with players.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((ap) => {
          const open = openApp === ap.id;
          const st = ST_COLORS[ap.status] ? ap.status : 'new';
          const [stBg, stColor, stBorder] = ST_COLORS[st];
          const d = ap.submittedAt ? new Date(ap.submittedAt) : null;
          const meta = [d ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : '', speciesOf(ap), classOf(ap)].filter(Boolean).join(' · ');
          const sections = open ? summarize(ap, draft.registration) : [];

          return (
            <div key={ap.id} style={{ background: open ? 'var(--panel)' : 'transparent', border: `1px solid ${mutedInk(open ? 20 : 12)}` }}>
              <button
                type="button"
                style={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  width: '100%',
                  cursor: 'pointer',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto 32px',
                  gap: 12,
                  alignItems: 'center',
                  padding: '12px clamp(12px, 3vw, 18px)',
                  minHeight: 64,
                }}
                onClick={() => setOpenApp(open ? '' : ap.id)}
              >
                <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ap.name || 'Unnamed'} · {ap.discord || 'no Discord'}
                  </span>
                  <span style={{ fontSize: 12, color: mutedInk(60), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meta}</span>
                </span>
                <span style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: stBg, color: stColor, border: `1px solid ${stBorder}` }}>
                  {STATUSES.find((s) => s.v === st)?.label}
                </span>
                <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', border: `1px solid ${mutedInk(30)}`, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18 }}>
                  {open ? '−' : '+'}
                </span>
              </button>

              {open && (
                <div style={{ padding: '4px clamp(12px, 3vw, 18px) 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {STATUSES.map((s) => (
                      <button
                        key={s.v}
                        type="button"
                        style={{
                          all: 'unset',
                          boxSizing: 'border-box',
                          cursor: 'pointer',
                          height: 40,
                          padding: '0 14px',
                          display: 'flex',
                          alignItems: 'center',
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 700,
                          fontSize: 12,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          background: st === s.v ? 'var(--color-accent)' : mutedInk(10),
                          color: st === s.v ? '#ffffff' : 'var(--color-bg)',
                        }}
                        onClick={() => changeStatus(ap, s.v)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {sections.map((sec) => (
                    <div key={sec.n} style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', paddingBottom: 8, borderBottom: `2px solid ${mutedInk(14)}` }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13, color: 'var(--color-accent-400)' }}>{sec.n}</span>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14, textTransform: 'uppercase' }}>{sec.title}</span>
                      </div>
                      {sec.items.map((it, i) => (
                        <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 16px', padding: '10px 0', borderBottom: `1px solid ${mutedInk(8)}` }}>
                          <span style={{ flex: '1 1 160px', maxWidth: 220, fontSize: 13, lineHeight: 1.5, color: mutedInk(60) }}>{it.q}</span>
                          <span style={{ flex: '999 1 260px', minWidth: 0, fontSize: 15, lineHeight: 1.55, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{it.a}</span>
                        </div>
                      ))}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="admin-text-link"
                    style={{ all: 'unset', cursor: 'pointer', alignSelf: 'flex-start', minHeight: 32, fontSize: 13, color: 'var(--color-accent-400)' }}
                    onClick={() => deleteApplication(ap)}
                  >
                    Delete this application
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
