export function RecapsSkeleton() {
  return (
    <div style={{ padding: 'clamp(36px, 6vw, 72px) clamp(16px, 4vw, 48px)', display: 'flex', flexDirection: 'column', gap: 36, maxWidth: 900 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="campaign-skel" style={{ width: 160, height: 12 }} />
        <div className="campaign-skel" style={{ width: 320, height: 44 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="campaign-skel" style={{ width: '100%', height: 76 }} />
        ))}
      </div>
    </div>
  );
}
