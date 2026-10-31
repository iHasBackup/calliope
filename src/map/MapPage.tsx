import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../campaign/useContent';
import { useDarkBody } from '../campaign/useDarkBody';
import { MAP_IMAGE, type MapPlace } from '../campaign/map';
import '../campaign/campaign.css';
import './map.css';

const STATUS: Record<string, string> = { visited: 'Visited', known: 'Heard of', hidden: 'Unexplored' };
const lines = (v: string) =>
  v
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function Skeleton() {
  return (
    <div className="mp-skel" aria-busy="true" aria-label="Loading map">
      <div style={{ flex: '999 1 520px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ aspectRatio: '1561 / 1008' }} />
        <div style={{ height: 20, maxWidth: 420 }} />
      </div>
      <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ height: 88 }} />
        <div style={{ height: 44 }} />
        <div style={{ height: 44 }} />
        <div style={{ height: 44 }} />
      </div>
    </div>
  );
}

export default function MapPage({ showSkeleton = false }: { showSkeleton?: boolean }) {
  useDarkBody();
  const { content, loading } = useContent();
  const map = content.map;
  const [sel, setSel] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  // The spotlight: which place it sits on, whether it has grown, and whether
  // to jump (no transition) while it moves to a new place at 0%.
  const [spot, setSpot] = useState<{ id: string | null; grown: boolean; snap: boolean }>({ id: null, grown: false, snap: false });
  const raf = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Map of Wickermoor · The Crooked Moon';
  }, []);

  const grow = useCallback((id: string) => {
    setSpot((cur) => {
      if (cur.id === id && cur.grown) return cur;
      cancelAnimationFrame(raf.current);
      // Snap to 0% at the new place, then grow on the second frame so the transition runs.
      raf.current = requestAnimationFrame(() => {
        raf.current = requestAnimationFrame(() => setSpot({ id, grown: true, snap: false }));
      });
      return { id, grown: false, snap: true };
    });
  }, []);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const select = (id: string) => {
    setSel(id);
    grow(id);
  };
  const hoverOn = (id: string) => {
    setHover(id);
    grow(id);
  };
  const hoverOff = (id: string) => {
    setHover((h) => (h === id ? null : h));
    if (sel && sel !== id) grow(sel); // the circle comes back to the selected place
  };
  const clear = () => {
    setSel(null);
    setHover(null);
  };

  useEffect(() => {
    if (!sel) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && clear();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sel]);

  // On a phone the map scrolls sideways: start centred on the party.
  useEffect(() => {
    if (loading) return;
    const box = scrollRef.current;
    const pp = map.places.find((p) => p.id === map.partyAt);
    if (box && pp && box.scrollWidth > box.clientWidth) box.scrollLeft = (pp.x / 100) * box.scrollWidth - box.clientWidth / 2;
  }, [loading, map]);

  const byId = new Map(map.places.map((p) => [p.id, p]));
  const shown = map.places.filter((p) => p.status !== 'hidden');
  const pp = byId.get(map.partyAt) ?? null;
  const active = hover || sel;
  const spotPlace = (spot.id && byId.get(spot.id)) || { x: 50, y: 50 };
  const spotOn = !!active && active === spot.id && spot.grown;
  const image = map.image || MAP_IMAGE;

  const holes = [...shown, ...(pp && pp.status === 'hidden' ? [pp] : [])].map((p) => {
    const big = p.status !== 'known';
    return `radial-gradient(ellipse ${big ? 10 : 6.5}% ${big ? 15.5 : 10}% at ${p.x}% ${p.y}%, transparent 45%, #000 100%)`;
  });
  const fogMask = holes.length ? holes.join(', ') : 'none';
  const route = map.path.map((id) => byId.get(id)).filter((p): p is MapPlace => !!p && p.status !== 'hidden');
  const visited = shown.filter((p) => p.status === 'visited');
  const known = shown.filter((p) => p.status === 'known');
  const sp = sel ? byId.get(sel) : undefined;

  const listRow = (p: MapPlace) => (
    <button
      key={p.id}
      type="button"
      className="mp-row"
      onClick={() => select(p.id)}
      onMouseEnter={() => hoverOn(p.id)}
      onMouseLeave={() => hoverOff(p.id)}
      onFocus={() => hoverOn(p.id)}
      onBlur={() => hoverOff(p.id)}
    >
      <span
        className="mp-sq"
        style={{ width: 12, height: 12, background: p.status === 'visited' ? 'var(--color-accent)' : 'var(--color-bg)' }}
      />
      <span>{p.name}</span>
      <span aria-hidden="true">&rarr;</span>
    </button>
  );

  let detail = null;
  if (sp) {
    const npcs = lines(sp.npcs).map((l) => {
      const parts = l.split(/\s+[—–-]\s+/);
      return { name: parts[0], role: parts.slice(1).join(' — ') };
    });
    const rumors = lines(sp.rumors);
    const v = sp.status === 'visited';
    detail = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, margin: '-10px -10px 0 0' }}>
          <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {sp.status !== 'hidden' && (
              <span
                className="mp-tag"
                style={{
                  background: v ? 'var(--color-accent)' : 'transparent',
                  color: v ? '#fff' : 'var(--color-bg)',
                  borderColor: v ? 'var(--color-accent)' : 'color-mix(in srgb, var(--color-bg) 45%, transparent)',
                }}
              >
                {STATUS[sp.status]}
              </span>
            )}
            {sp.id === map.partyAt && (
              <span className="mp-tag" style={{ background: 'var(--color-bg)', color: 'var(--color-text)', borderColor: 'var(--color-bg)' }}>
                Party is here
              </span>
            )}
          </span>
          <button type="button" className="mp-close" aria-label="Close" onClick={clear}>
            &times;
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 className="mp-heading" style={{ margin: 0, fontSize: 'clamp(28px, 3vw, 36px)', lineHeight: 0.95, letterSpacing: '-0.02em', textWrap: 'balance' }}>
            {sp.name}
          </h2>
          {sp.desc.trim() && (
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'color-mix(in srgb, var(--color-bg) 85%, transparent)', textWrap: 'pretty', whiteSpace: 'pre-line' }}>{sp.desc}</p>
          )}
        </div>
        {npcs.length > 0 && (
          <div className="mp-block">
            <span className="mp-label" style={{ paddingBottom: 6 }}>
              Notable NPCs
            </span>
            {npcs.map((n, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 0', borderBottom: '1px solid color-mix(in srgb, var(--color-bg) 10%, transparent)' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{n.name}</span>
                {n.role && <span style={{ fontSize: 13, color: 'color-mix(in srgb, var(--color-bg) 65%, transparent)' }}>{n.role}</span>}
              </div>
            ))}
          </div>
        )}
        {rumors.length > 0 && (
          <div className="mp-block" style={{ gap: 10 }}>
            <span className="mp-label" style={{ color: 'var(--color-accent-400)' }}>
              Rumors &amp; hooks
            </span>
            {rumors.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '18px minmax(0, 1fr)', gap: 8, alignItems: 'start' }}>
                <span style={{ width: 8, height: 8, marginTop: 7, border: '2px solid var(--color-accent)', transform: 'rotate(45deg)' }} />
                <span style={{ fontSize: 15, lineHeight: 1.5, textWrap: 'pretty' }}>{r}</span>
              </div>
            ))}
          </div>
        )}
        {!npcs.length && !rumors.length && !sp.desc.trim() && <span style={{ fontSize: 14, color: 'color-mix(in srgb, var(--color-bg) 60%, transparent)' }}>Nothing recorded here yet.</span>}
      </div>
    );
  }

  const isLoading = loading || showSkeleton;

  return (
    <div className="mp">
      <header className="mp-top">
        <span className="mp-mark">The Crooked Moon</span>
        <Link className="mp-back" to="/thecrookedmoon#activities">
          <span aria-hidden="true">&larr;</span>
          <span>Activities</span>
        </Link>
      </header>
      <div className="mp-title">
        <span>Map</span>
        <h1 className="mp-heading">Wickermoor</h1>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : (
        <div className="mp-body">
          <div style={{ minWidth: 0 }}>
            <div className="mp-scroll" ref={scrollRef}>
              <div className="mp-map" onClick={clear}>
                <img className="mp-base" src={image} alt="Illustrated map of the Wickermoor vale" draggable={false} width={1561} height={1008} />
                {pp && <img src={image} alt="" aria-hidden="true" draggable={false} style={{ clipPath: `circle(9% at ${pp.x}% ${pp.y}%)` }} />}
                <img
                  className={`mp-spot${spot.snap ? ' is-snap' : ''}`}
                  data-anim=""
                  src={image}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  style={{ clipPath: `circle(${spotOn ? '11%' : '0%'} at ${spotPlace.x}% ${spotPlace.y}%)` }}
                />
                <div className="mp-fog" aria-hidden="true" style={{ maskImage: fogMask, WebkitMaskImage: fogMask }} />
                {route.length > 1 && (
                  <svg className="mp-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <polyline className="under" points={route.map((p) => `${p.x},${p.y}`).join(' ')} />
                    <polyline className="ants" data-anim="" points={route.map((p) => `${p.x},${p.y}`).join(' ')} />
                  </svg>
                )}
                {shown
                  .filter((p) => p.id !== map.partyAt)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`mp-pin${active === p.id ? ' is-on' : ''}`}
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      aria-label={`${p.name}, ${STATUS[p.status].toLowerCase()}`}
                      aria-pressed={sel === p.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        select(p.id);
                      }}
                      onMouseEnter={() => hoverOn(p.id)}
                      onMouseLeave={() => hoverOff(p.id)}
                      onFocus={() => hoverOn(p.id)}
                      onBlur={() => hoverOff(p.id)}
                    >
                      <span className={`mp-dot is-${p.status}`} data-anim="" />
                      <span className="mp-tip" data-anim="" aria-hidden="true">
                        {p.name}
                      </span>
                    </button>
                  ))}
                {pp && (
                  <button
                    type="button"
                    className={`mp-party${active === pp.id ? ' is-on' : ''}${sel === pp.id ? ' is-sel' : ''}`}
                    style={{ left: `${pp.x}%`, top: `${pp.y}%` }}
                    aria-label={`The party is at ${pp.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      select(pp.id);
                    }}
                    onMouseEnter={() => hoverOn(pp.id)}
                    onMouseLeave={() => hoverOff(pp.id)}
                    onFocus={() => hoverOn(pp.id)}
                    onBlur={() => hoverOff(pp.id)}
                  >
                    <span className="mp-party-ring" data-anim="" aria-hidden="true" />
                    <span className="mp-party-dot" data-anim="">
                      <UsersIcon />
                    </span>
                    <span className="mp-party-tag" aria-hidden="true">
                      Party
                    </span>
                  </button>
                )}
              </div>
            </div>
            <div className="mp-legend">
              <span>
                <span className="mp-sq" style={{ width: 14, height: 14, background: 'var(--color-accent)', border: '2px solid #fff' }} />
                Visited
              </span>
              <span>
                <span
                  className="mp-sq"
                  style={{ width: 12, height: 12, background: 'var(--color-bg)', border: '2px solid var(--color-text)', outline: '1px solid color-mix(in srgb, var(--color-bg) 50%, transparent)' }}
                />
                Heard of
              </span>
              <span>
                <svg width="28" height="6" viewBox="0 0 28 6" aria-hidden="true">
                  <line x1="0" y1="3" x2="28" y2="3" style={{ stroke: 'var(--color-accent)', strokeWidth: 3, strokeDasharray: '7 5' }} />
                </svg>
                Route so far
              </span>
              <span>
                <span
                  className="mp-sq"
                  style={{ width: 14, height: 14, background: 'color-mix(in srgb, var(--color-bg) 12%, var(--color-text))', border: '1px solid color-mix(in srgb, var(--color-bg) 35%, transparent)' }}
                />
                Unexplored
              </span>
              <span className="mp-scroll-hint" style={{ flexBasis: '100%' }}>
                Scroll sideways to see the whole vale.
              </span>
            </div>
          </div>

          <aside className={`mp-panel${sp ? ' is-sheet' : ''}`} data-anim="" aria-label="Places">
            {detail ?? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {pp && (
                  <button type="button" className="mp-at" onClick={() => select(pp.id)} onMouseEnter={() => hoverOn(pp.id)} onMouseLeave={() => hoverOff(pp.id)}>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase' }}>The party is at</span>
                      <span className="mp-heading" style={{ fontSize: 22, lineHeight: 1.05 }}>
                        {pp.name}
                      </span>
                    </span>
                    <span aria-hidden="true" style={{ fontSize: 20 }}>
                      &rarr;
                    </span>
                  </button>
                )}
                {visited.length > 0 && (
                  <div className="mp-group">
                    <span className="mp-label">Visited · {visited.length}</span>
                    {visited.map(listRow)}
                  </div>
                )}
                {known.length > 0 && (
                  <div className="mp-group">
                    <span className="mp-label">Heard of · {known.length}</span>
                    {known.map(listRow)}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
