import { Link } from 'react-router-dom';
import '../campaign.css';
import './admin.css';
import { mutedInk } from './fields';
import { Gate } from './Gate';
import { CampaignSection } from './sections/CampaignSection';
import { ScheduleSection } from './sections/ScheduleSection';
import { PartySection } from './sections/PartySection';
import { RecapsSection } from './sections/RecapsSection';
import { QuestsSection } from './sections/QuestsSection';
import { useAdmin, type Section } from './useAdmin';
import { useDarkBody } from '../useDarkBody';

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'campaign', label: 'Campaign' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'party', label: 'Party' },
  { key: 'recaps', label: 'Recaps' },
  { key: 'quests', label: 'Quest log' },
];

export default function AdminPage() {
  const admin = useAdmin();
  useDarkBody();
  const narrow = admin.width < 820;
  const brandHidden = admin.width < 520;

  const counts: Record<Section, string> = {
    campaign: '',
    schedule: '',
    party: admin.hasDraft ? String(admin.draft.party.length) : '',
    recaps: admin.hasDraft ? String(admin.draft.recaps.length) : '',
    quests: admin.hasDraft ? String(admin.draft.threads.length) : '',
  };

  const status = admin.flash || (admin.isDirty ? 'Unsaved changes' : 'All changes saved');
  const statusColor = admin.isDirty && !admin.flash ? 'var(--color-accent-400)' : mutedInk(60);

  return (
    <div className="campaign-site">
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          gap: 12,
          padding: '6px clamp(10px, 4vw, 48px)',
          minHeight: 56,
          boxSizing: 'border-box',
          background: 'color-mix(in srgb, var(--color-text) 92%, transparent)',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${mutedInk(14)}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ width: 12, height: 12, flex: 'none', background: 'var(--color-accent)', transform: 'rotate(45deg)' }} />
          {!brandHidden && (
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 'clamp(12px, 3.4vw, 16px)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              The Crooked Moon
            </div>
          )}
          <span style={{ border: `1px solid ${mutedInk(40)}`, padding: '3px 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', flex: 'none' }}>
            Admin
          </span>
        </div>
        {admin.unlocked && admin.hasDraft && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 16px)', flex: 'none' }}>
            {admin.width >= 640 && <span style={{ fontSize: 13, color: statusColor, whiteSpace: 'nowrap' }}>{status}</span>}
            <Link
              to="/thecrookedmoon"
              style={{ height: 44, display: 'flex', alignItems: 'center', padding: '0 4px', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-bg)' }}
            >
              View site
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              style={{ height: 44, padding: '0 18px', fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: admin.isDirty ? 1 : 0.45 }}
              onClick={admin.save}
              disabled={admin.saving}
            >
              {admin.isDirty ? 'Save' : 'Saved'}
            </button>
          </div>
        )}
      </div>

      {admin.checkingSession ? null : !admin.unlocked ? (
        <Gate code={admin.code} setCode={admin.setCode} codeErr={admin.codeErr} setCodeErr={admin.setCodeErr} unlock={admin.unlock} />
      ) : !admin.hasDraft ? (
        <div style={{ padding: 48, fontSize: 15 }}>Loading content&hellip;</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 'clamp(20px, 4vw, 48px)', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 48px) clamp(56px, 8vw, 96px)' }}>
          <div
            style={{
              flex: '1 1 200px',
              maxWidth: narrow ? '100%' : 240,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              position: narrow ? 'static' : 'sticky',
              top: 80,
            }}
          >
            <div style={{ display: 'flex', flexDirection: narrow ? 'row' : 'column', flexWrap: 'wrap', gap: 2 }}>
              {SECTIONS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  style={{
                    all: 'unset',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    height: 44,
                    padding: '0 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    background: admin.section === s.key ? 'var(--color-accent)' : 'transparent',
                    color: admin.section === s.key ? '#ffffff' : mutedInk(75),
                  }}
                  onClick={() => {
                    admin.setSection(s.key);
                    window.scrollTo(0, 0);
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', opacity: 0.75 }}>{counts[s.key]}</span>
                </button>
              ))}
            </div>
            {!narrow && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 16, borderTop: `1px solid ${mutedInk(14)}` }}>
                <span style={{ fontSize: 12, lineHeight: 1.5, color: mutedInk(55) }}>
                  Changes go live on the site when you save. Ctrl/&#8984; + S also saves.
                </span>
                <button
                  type="button"
                  className="admin-text-link"
                  style={{ all: 'unset', cursor: 'pointer', fontSize: 13, color: 'var(--color-accent-400)', minHeight: 32 }}
                  onClick={admin.revertToSaved}
                >
                  Revert to last saved
                </button>
              </div>
            )}
          </div>

          <div style={{ flex: '999 1 480px', minWidth: 0, maxWidth: 820, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {admin.conflict && (
              <div style={{ background: 'color-mix(in srgb, var(--color-accent) 16%, var(--color-text))', border: '1px solid var(--color-accent)', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 14, lineHeight: 1.5 }}>
                  This content was changed elsewhere since you loaded it. Your edits weren&rsquo;t saved.
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ height: 36, alignSelf: 'flex-start' }}
                  onClick={admin.acceptConflict}
                >
                  Load the latest version
                </button>
              </div>
            )}

            {admin.section === 'campaign' && <CampaignSection draft={admin.draft} update={admin.update} />}
            {admin.section === 'schedule' && <ScheduleSection draft={admin.draft} update={admin.update} />}
            {admin.section === 'party' && (
              <PartySection draft={admin.draft} update={admin.update} removeMember={admin.removeMember} addMember={admin.addMember} />
            )}
            {admin.section === 'recaps' && (
              <RecapsSection
                draft={admin.draft}
                update={admin.update}
                openRecap={admin.openRecap}
                setOpenRecap={admin.setOpenRecap}
                addRecap={admin.addRecap}
                removeRecap={admin.removeRecap}
              />
            )}
            {admin.section === 'quests' && (
              <QuestsSection draft={admin.draft} update={admin.update} addThread={admin.addThread} removeThread={admin.removeThread} />
            )}

            {narrow && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 16, borderTop: `1px solid ${mutedInk(14)}` }}>
                <span style={{ fontSize: 12, lineHeight: 1.5, color: mutedInk(55) }}>Changes go live on the site when you save.</span>
                <button
                  type="button"
                  className="admin-text-link"
                  style={{ all: 'unset', cursor: 'pointer', fontSize: 13, color: 'var(--color-accent-400)', minHeight: 32, alignSelf: 'flex-start' }}
                  onClick={admin.revertToSaved}
                >
                  Revert to last saved
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
