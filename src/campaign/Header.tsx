import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { CampaignView } from './useCampaignSite';

const TABS: { key: CampaignView; label: string }[] = [
  { key: 'home', label: 'Campaign' },
  { key: 'recaps', label: 'Recaps' },
  { key: 'activities', label: 'Activities' },
];

const mutedInk = (pct: number) => `color-mix(in srgb, var(--color-bg) ${pct}%, transparent)`;

export function Header({
  view,
  go,
  width,
  menuOpen,
  setMenuOpen,
}: {
  view: CampaignView;
  go: (v: CampaignView) => void;
  width: number;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
}) {
  const wide = width >= 640;
  const scrollYRef = useRef(0);

  // Lock background scroll while the mobile menu overlay is open. Plain
  // overflow:hidden on body doesn't reliably stop touch-scroll/rubber-band
  // on iOS Safari, so pin body in place with position:fixed at the saved
  // scroll offset and restore it on close.
  useEffect(() => {
    if (!menuOpen) return;
    scrollYRef.current = window.scrollY;
    const { style } = document.body;
    const prev = { position: style.position, top: style.top, left: style.left, right: style.right, width: style.width, overflow: style.overflow };
    style.position = 'fixed';
    style.top = `-${scrollYRef.current}px`;
    style.left = '0';
    style.right = '0';
    style.width = '100%';
    style.overflow = 'hidden';
    return () => {
      style.position = prev.position;
      style.top = prev.top;
      style.left = prev.left;
      style.right = prev.right;
      style.width = prev.width;
      style.overflow = prev.overflow;
      window.scrollTo(0, scrollYRef.current);
    };
  }, [menuOpen]);

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
        minHeight: 57,
        boxSizing: 'border-box',
        background: 'color-mix(in srgb, var(--color-text) 92%, transparent)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div
          style={{
            width: 28,
            height: 28,
            flex: 'none',
            display: 'grid',
            placeItems: 'center',
            background: 'var(--color-accent)',
            color: '#ffffff',
            borderRadius: 6,
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 17,
            lineHeight: 1,
          }}
        >
          C
        </div>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 'clamp(12px, 3.9vw, 16px)',
            letterSpacing: 'clamp(0.02em, 0.5vw, 0.08em)',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          The Crooked Moon
        </div>
      </div>

      {wide ? (
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
                color: view === t.key ? '#ffffff' : mutedInk(75),
                background: view === t.key ? 'var(--color-accent)' : 'transparent',
              }}
              onClick={() => go(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : (
        <>
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            style={{
              all: 'unset',
              cursor: 'pointer',
              width: 44,
              height: 44,
              flex: 'none',
              display: 'grid',
              placeItems: 'center',
              background: menuOpen ? 'var(--color-accent)' : 'transparent',
              boxSizing: 'border-box',
            }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span style={{ position: 'relative', width: 20, height: 14, display: 'block' }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: i * 6,
                    width: 20,
                    height: 2,
                    background: 'var(--color-bg)',
                    transition: 'transform 0.2s, opacity 0.2s',
                    transformOrigin: 'center',
                    transform: menuOpen
                      ? i === 0
                        ? 'translateY(7px) rotate(45deg)'
                        : i === 2
                          ? 'translateY(-7px) rotate(-45deg)'
                          : 'none'
                      : 'none',
                    opacity: menuOpen && i === 1 ? 0 : 1,
                  }}
                />
              ))}
            </span>
          </button>

          {menuOpen &&
            createPortal(
              <>
                <div
                  style={{ position: 'fixed', top: 57, left: 0, right: 0, bottom: 0, background: '#000000', zIndex: 19 }}
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  style={{
                    position: 'fixed',
                    top: 57,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 21,
                    background: '#000000',
                    borderBottom: '2px solid var(--color-accent)',
                  }}
                >
                  {TABS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      style={{
                        all: 'unset',
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                        width: '100%',
                        minHeight: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 clamp(16px, 4vw, 48px)',
                        borderBottom: `1px solid ${mutedInk(14)}`,
                        background: view === t.key ? 'var(--color-accent)' : 'transparent',
                        color: view === t.key ? '#ffffff' : 'var(--color-bg)',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 800,
                        fontSize: 20,
                        textTransform: 'uppercase',
                      }}
                      onClick={() => go(t.key)}
                    >
                      <span>{t.label}</span>
                      <span>&rarr;</span>
                    </button>
                  ))}
                </div>
              </>,
              document.body,
            )}
        </>
      )}
    </div>
  );
}
