// Mirrors the open intro (same grid and padding) so nothing jumps when
// content arrives. Spec: design/REGISTRATION.md, "Loading skeleton".
const BAR = 'color-mix(in srgb, var(--color-bg) 12%, var(--color-text))';
const RULE = 'color-mix(in srgb, var(--color-bg) 18%, transparent)';

function Bar({ width = '100%', height, style }: { width?: number | string; height: number | string; style?: React.CSSProperties }) {
  return <div style={{ width, height, background: BAR, ...style }} />;
}

export function RegistrationSkeleton() {
  return (
    <div
      className="reg-skel"
      aria-busy="true"
      aria-label="Loading registration"
      style={{ padding: 'clamp(40px, 7vw, 96px) clamp(16px, 4vw, 48px) clamp(56px, 8vw, 96px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 'clamp(36px, 6vw, 80px)', alignItems: 'start' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
        <Bar width={220} height={12} style={{ maxWidth: '70%' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Bar width="90%" height="clamp(40px, 7vw, 92px)" />
          <Bar width="60%" height="clamp(40px, 7vw, 92px)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560 }}>
          <Bar height={14} />
          <Bar height={14} />
          <Bar width="70%" height={14} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
          <div style={{ height: 86, background: 'var(--panel)', borderLeft: `3px solid ${RULE}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', boxSizing: 'border-box', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <Bar width={70} height={10} />
              <Bar width={140} height={18} style={{ maxWidth: '100%' }} />
            </div>
            <Bar width={96} height={62} style={{ flex: 'none' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12 }}>
            <div style={{ height: 66, background: 'var(--panel)' }} />
            <div style={{ height: 66, background: 'var(--panel)' }} />
          </div>
        </div>
        <Bar width={220} height={52} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', borderTop: `3px solid ${RULE}`, background: 'var(--panel)' }}>
        <div style={{ padding: '18px 20px 12px' }}>
          <Bar width={140} height={14} />
        </div>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr)', gap: 12, padding: '16px 20px', borderTop: '1px solid color-mix(in srgb, var(--color-bg) 12%, transparent)' }}>
            <Bar width={28} height={22} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Bar width="55%" height={16} />
              <Bar width="85%" height={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
