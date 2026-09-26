import { mutedInk } from './fields';

export function Gate({
  code,
  setCode,
  codeErr,
  setCodeErr,
  unlock,
}: {
  code: string;
  setCode: (v: string) => void;
  codeErr: string;
  setCodeErr: (v: string) => void;
  unlock: () => void;
}) {
  return (
    <div style={{ padding: 'clamp(48px, 10vw, 120px) clamp(16px, 4vw, 48px)', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent-400)' }}>
        Dungeon master only
      </span>
      <h1 style={{ margin: 0, fontSize: 'clamp(40px, 7vw, 72px)', lineHeight: 0.9, letterSpacing: '-0.035em', textTransform: 'uppercase' }}>
        Campaign admin
      </h1>
      <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: mutedInk(80) }}>
        Enter the passcode to edit the campaign, party, recaps and quest log.
      </p>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: mutedInk(65) }}>Passcode</span>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="password"
            value={code}
            autoComplete="current-password"
            onChange={(e) => {
              setCode(e.target.value);
              setCodeErr('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') unlock();
            }}
            style={{
              flex: '1 1 200px',
              minWidth: 0,
              boxSizing: 'border-box',
              height: 48,
              padding: '0 12px',
              background: 'var(--color-text)',
              color: 'var(--color-bg)',
              border: `1px solid ${mutedInk(22)}`,
              borderRadius: 0,
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              outline: 'none',
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            style={{ height: 48, padding: '0 22px', fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}
            onClick={unlock}
          >
            Unlock
          </button>
        </div>
      </label>
      <div style={{ minHeight: 18, fontSize: 13, color: 'var(--color-accent-400)' }}>{codeErr}</div>
    </div>
  );
}
