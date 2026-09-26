// Key art and portraits are supplied by the campaign owner — none exist
// yet, so this renders a plain placeholder in their place. Swap in a real
// <img src={url}> (still wrapped in .grayscale) once content exists.
export function PlaceholderImage({ url, label }: { url?: string; label: string }) {
  if (url) {
    return (
      <div className="grayscale" style={{ position: 'absolute', inset: 0 }}>
        <img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  return (
    <div
      className="grayscale"
      style={{
        position: 'absolute',
        inset: 0,
        background: 'color-mix(in srgb, var(--color-bg) 10%, var(--color-text))',
        display: 'flex',
        // Top-anchored, not centered: a vertically-centered label would sit
        // inside the bottom gradient scrim these placeholders are used
        // under (party cards, hero) and bleed through behind the real
        // name/species text drawn on top of it there.
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '44px 8px 8px',
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          textAlign: 'center',
          color: 'color-mix(in srgb, var(--color-bg) 40%, transparent)',
        }}
      >
        {label}
      </span>
    </div>
  );
}
