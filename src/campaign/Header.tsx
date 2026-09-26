import type { CampaignView } from './useCampaignSite';

const TABS: { key: CampaignView; label: string }[] = [
  { key: 'home', label: 'Campaign' },
  { key: 'recaps', label: 'Recaps' },
  { key: 'activities', label: 'Activities' },
];

export function Header({
  view,
  go,
  narrowBrand,
}: {
  view: CampaignView;
  go: (v: CampaignView) => void;
  narrowBrand: boolean;
}) {
  return (
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
        background: 'color-mix(in srgb, var(--color-text) 92%, transparent)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid color-mix(in srgb, var(--color-bg) 14%, transparent)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: '0 1 auto' }}>
        <div style={{ width: 12, height: 12, flex: 'none', background: 'var(--color-accent)', transform: 'rotate(45deg)' }} />
        {!narrowBrand && (
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
      </div>
      <div style={{ display: 'flex', gap: 2, flex: 'none' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            style={{
              all: 'unset',
              cursor: 'pointer',
              height: 44,
              padding: '0 clamp(8px, 2.6vw, 14px)',
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 'clamp(11px, 3.2vw, 13px)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: view === t.key ? '#ffffff' : 'color-mix(in srgb, var(--color-bg) 75%, transparent)',
              background: view === t.key ? 'var(--color-accent)' : 'transparent',
            }}
            onClick={() => go(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
