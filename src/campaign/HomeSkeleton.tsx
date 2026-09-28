function Bar({ width, height = 16 }: { width: number | string; height?: number }) {
  return <div className="campaign-skel" style={{ width, height }} />;
}

export function HomeSkeleton() {
  return (
    <div>
      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="campaign-skel" style={{ width: '100%', height: 'clamp(200px, 32vw, 400px)' }} />
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 32,
            padding: 'clamp(20px, 3vw, 32px) clamp(16px, 4vw, 48px) clamp(28px, 4vw, 44px)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720, flex: '1 1 320px', minWidth: 0 }}>
            <Bar width={180} height={14} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Bar width="80%" height={56} />
              <Bar width="55%" height={56} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 480 }}>
              <Bar width="100%" height={14} />
              <Bar width="90%" height={14} />
              <Bar width="70%" height={14} />
            </div>
            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <Bar width={180} height={48} />
              <Bar width={150} height={48} />
            </div>
          </div>
          <div style={{ width: 'min(100%, 320px)' }}>
            <Bar width="100%" height={168} />
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ padding: '0 clamp(16px, 4vw, 48px)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: '1 1 150px' }}>
            <Bar width="100%" height={80} />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <Bar width="100%" height={80} />
          </div>
          <div style={{ flex: '2 1 300px' }}>
            <Bar width="100%" height={80} />
          </div>
        </div>
      </div>

      {/* Party */}
      <div style={{ padding: 'clamp(48px, 7vw, 88px) clamp(16px, 4vw, 48px) 0', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Bar width={140} height={12} />
          <Bar width={220} height={40} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 'clamp(10px, 1.6vw, 20px)' }}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="campaign-skel" style={{ aspectRatio: '3 / 4.2' }} />
          ))}
        </div>
      </div>

      {/* Story + quest log */}
      <div
        style={{
          padding: 'clamp(48px, 7vw, 88px) clamp(16px, 4vw, 48px) clamp(56px, 8vw, 96px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
          gap: 'clamp(28px, 5vw, 56px)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Bar width={120} height={12} />
          <Bar width={280} height={40} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Bar width="100%" height={14} />
            <Bar width="95%" height={14} />
            <Bar width="80%" height={14} />
          </div>
        </div>
        <Bar width="100%" height={220} />
      </div>
    </div>
  );
}
