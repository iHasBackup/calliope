import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
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
  showApply,
}: {
  view: CampaignView;
  go: (v: CampaignView) => void;
  width: number;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  showApply: boolean;
}) {
  const wide = width >= 640;
  const scrollYRef = useRef(0);

  // The red block behind the active tab. Positioned directly on the element
  // (not through render-time styles, which lagged one click behind in the
  // prototype), from the target button's own offset — button positions don't
  // depend on which tab is active, so they can be measured before the change.
  const tabsRef = useRef<HTMLDivElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);
  const viewRef = useRef(view);
  viewRef.current = view;
  const placeInd = useCallback((index: number, animate: boolean) => {
    const ind = indRef.current;
    const btn = tabsRef.current?.querySelectorAll<HTMLElement>('[data-tab]')[index];
    if (!ind || !btn) return;
    if (animate && !placed.current) {
      // First click before any placement: start under the current tab so it still slides.
      placeInd(TABS.findIndex((t) => t.key === viewRef.current), false);
    }
    ind.classList.toggle('is-moving', animate);
    if (animate) void ind.offsetWidth; // commit the start position before the transition
    ind.style.transform = `translateX(${btn.offsetLeft}px)`;
    ind.style.width = `${btn.offsetWidth}px`;
    placed.current = true;
  }, []);
  // First placement, and again once Archivo has loaded and on resize: no slide.
  useLayoutEffect(() => {
    if (!wide) {
      placed.current = false;
      return;
    }
    const place = () => placeInd(TABS.findIndex((t) => t.key === viewRef.current), false);
    place();
    document.fonts?.ready.then(place).catch(() => {});
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [wide, placeInd]);

  // A view change from anywhere (a button on the page, the address hash)
  // slides too. Only a real change of view: crossing the phone/desktop
  // width remounts the tabs and is handled by the placement above.
  const lastView = useRef(view);
  useEffect(() => {
    if (lastView.current === view) return;
    lastView.current = view;
    if (wide && placed.current) placeInd(TABS.findIndex((t) => t.key === view), true);
  }, [view, wide, placeInd]);

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
        <div className="cm-tabs" ref={tabsRef}>
          <span className="cm-tab-ind" ref={indRef} data-anim="" aria-hidden="true" />
          {TABS.map((t, i) => (
            <button
              key={t.key}
              type="button"
              className="cm-tab"
              data-tab=""
              data-anim=""
              aria-current={view === t.key ? 'page' : undefined}
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
                position: 'relative',
                color: view === t.key ? '#ffffff' : mutedInk(75),
                background: 'transparent',
              }}
              onClick={() => {
                placeInd(i, true);
                go(t.key);
              }}
            >
              {t.label}
            </button>
          ))}
          {showApply && (
            <Link
              to="/thecrookedmoon/apply"
              style={{
                height: 44,
                padding: '0 clamp(8px, 2.6vw, 14px)',
                display: 'flex',
                alignItems: 'center',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 'clamp(11px, 3.2vw, 13px)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: mutedInk(75),
                background: 'transparent',
              }}
            >
              Apply
            </Link>
          )}
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
                  className="cm-menu-panel"
                  data-anim=""
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
                  {showApply && (
                    <Link
                      to="/thecrookedmoon/apply"
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
                        background: 'transparent',
                        color: 'var(--color-bg)',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 800,
                        fontSize: 20,
                        textTransform: 'uppercase',
                      }}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>Apply</span>
                      <span>&rarr;</span>
                    </Link>
                  )}
                </div>
              </>,
              document.body,
            )}
        </>
      )}
    </div>
  );
}
