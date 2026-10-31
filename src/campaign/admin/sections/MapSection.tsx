import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Content } from '../../content';
import { DEFAULT_MAP, MAP_IMAGE, type CampaignMap, type MapPlace, type PlaceStatus } from '../../map';
import { Panel, SectionHeader, mutedInk } from '../fields';

const STATUSES: [PlaceStatus, string][] = [
  ['hidden', 'Hidden'],
  ['known', 'Heard of'],
  ['visited', 'Visited'],
];
const uid = () => Math.random().toString(36).slice(2, 9);

const look = (p: MapPlace) =>
  p.status === 'visited'
    ? { fill: 'var(--color-accent)', ring: '#ffffff', style: 'solid' }
    : p.status === 'known'
      ? { fill: 'var(--color-bg)', ring: 'var(--color-text)', style: 'solid' }
      : { fill: 'color-mix(in srgb, var(--color-text) 40%, transparent)', ring: '#ffffff', style: 'dashed' };

const label: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: mutedInk(65) };
const input: React.CSSProperties = {
  boxSizing: 'border-box',
  width: '100%',
  height: 44,
  padding: '0 10px',
  background: 'var(--color-text)',
  color: 'var(--color-bg)',
  border: `1px solid ${mutedInk(22)}`,
  borderRadius: 0,
  fontFamily: 'var(--font-body)',
  fontSize: 16,
  outline: 'none',
};
const area: React.CSSProperties = { ...input, height: 'auto', padding: '10px 12px', lineHeight: 1.55, resize: 'vertical' };

function PinIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function MapSection({ draft, update }: { draft: Content; update: (fn: (c: Content) => void) => void }) {
  const m = draft.map ?? DEFAULT_MAP;
  const [open, setOpen] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const edit = (fn: (map: CampaignMap) => void) => update((c) => fn(c.map));
  // Move mode starts from rows far down the page: bring the map (and its
  // "click the map" bar) into view so the next click lands on it.
  const dmView = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!moving) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    dmView.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, [moving]);

  const byId = new Map(m.places.map((p) => [p.id, p]));
  const movingPlace = moving ? byId.get(moving) : undefined;
  const holes = m.places
    .filter((p) => p.status !== 'hidden' || p.id === m.partyAt)
    .map((p) => {
      const big = p.status !== 'known';
      return `radial-gradient(ellipse ${big ? 10 : 6.5}% ${big ? 15.5 : 10}% at ${p.x}% ${p.y}%, transparent 45%, #000 100%)`;
    });
  const fog = holes.length ? holes.join(', ') : 'none';
  const route = m.path.map((id) => byId.get(id)).filter((p): p is MapPlace => !!p);
  const options = (withEmpty: boolean) => [
    ...(withEmpty ? [{ v: '', label: 'Nowhere yet' }] : []),
    ...m.places.map((p) => ({ v: p.id, label: p.name + (p.status === 'hidden' ? ' (hidden)' : '') })),
  ];

  const placeAt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!movingPlace) return;
    const b = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - b.left) / b.width) * 1000) / 10));
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - b.top) / b.height) * 1000) / 10));
    const id = movingPlace.id;
    edit((map) => {
      const p = map.places.find((q) => q.id === id);
      if (p) Object.assign(p, { x, y });
    });
    setMoving(null);
  };
  const addPlace = () => {
    const id = `place-${uid()}`;
    edit((map) => map.places.push({ id, name: 'New place', x: 50, y: 50, status: 'hidden', desc: '', npcs: '', rumors: '' }));
    setOpen(id);
    setMoving(id);
  };
  const removePlace = (p: MapPlace) => {
    if (!window.confirm(`Remove ${p.name || 'this place'} from the map?`)) return;
    edit((map) => {
      map.places = map.places.filter((q) => q.id !== p.id);
      map.path = map.path.filter((id) => id !== p.id);
      if (map.partyAt === p.id) map.partyAt = '';
    });
    if (open === p.id) setOpen(null);
    if (moving === p.id) setMoving(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionHeader
        title="Map"
        description="Pins, fog of war and the party's route on the public map. Hidden places stay under the fog until you reveal them."
        action={
          <Link to="/thecrookedmoon/activities/map" target="_blank" rel="noreferrer" className="admin-outline-link">
            View map <span aria-hidden="true">&rarr;</span>
          </Link>
        }
      />

      <div ref={dmView} style={{ scrollMarginTop: 72 }}>
        <Panel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, textTransform: 'uppercase' }}>DM view</span>
            <span style={{ fontSize: 13, color: mutedInk(60) }}>Dashed pins are hidden from players. The shade shows their fog.</span>
          </div>
          {movingPlace && (
            <div
              role="status"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
                padding: '8px 8px 8px 14px',
                background: 'var(--color-accent)',
                color: '#ffffff',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600 }}>Click the map to place {movingPlace.name || 'this place'}</span>
              <button type="button" className="admin-map-done" onClick={() => setMoving(null)}>
                Done
              </button>
            </div>
          )}
          <div
            data-testid="dm-map"
            style={{ position: 'relative', aspectRatio: '1561 / 1008', overflow: 'hidden', cursor: movingPlace ? 'crosshair' : 'default', userSelect: 'none' }}
            onClick={placeAt}
          >
            <img
              src={m.image || MAP_IMAGE}
              alt="Wickermoor map"
              draggable={false}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
            />
            <div className="admin-map-fog" aria-hidden="true" style={{ maskImage: fog, WebkitMaskImage: fog }} />
            {route.length > 1 && (
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              >
                <polyline
                  points={route.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  style={{ stroke: 'var(--color-accent)', strokeWidth: 3, strokeDasharray: '8 6', vectorEffect: 'non-scaling-stroke' }}
                />
              </svg>
            )}
            {m.places.map((p) => {
              const lk = look(p);
              const party = p.id === m.partyAt;
              const hl = p.id === moving || p.id === open;
              return (
                <button
                  key={p.id}
                  type="button"
                  title={p.name + (party ? ' (party)' : '')}
                  aria-label={p.name + (party ? ' (party)' : '')}
                  className="admin-map-pin"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: hl ? 5 : party ? 4 : 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!moving) setOpen(p.id);
                  }}
                >
                  <span
                    style={{
                      width: party ? 20 : 14,
                      height: party ? 20 : 14,
                      boxSizing: 'border-box',
                      background: party ? 'var(--color-accent)' : lk.fill,
                      border: `2px ${lk.style} ${lk.ring}`,
                      outline: hl ? '2px solid #ffffff' : party ? '2px solid var(--color-accent)' : '0 solid transparent',
                      outlineOffset: 2,
                    }}
                  />
                </button>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel title="Party & route">
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 360 }}>
          <span style={label}>The party is at</span>
          <select value={m.partyAt} style={input} onChange={(e) => edit((map) => (map.partyAt = e.target.value))}>
            {options(true).map((o) => (
              <option key={o.v} value={o.v}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 14, borderTop: `1px solid ${mutedInk(14)}` }}>
          <span style={label}>Route so far</span>
          <span style={{ fontSize: 13, color: mutedInk(60) }}>Drawn in this order. Stops at hidden places are skipped on the public map.</span>
          {m.path.map((id, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr) 44px 44px 44px', gap: 6, alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 14,
                  color: 'var(--color-accent-400)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <select aria-label={`Stop ${i + 1}`} value={id} style={input} onChange={(e) => edit((map) => (map.path[i] = e.target.value))}>
                {options(false).map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="admin-map-icon"
                aria-label="Move stop up"
                disabled={i === 0}
                onClick={() => edit((map) => ([map.path[i - 1], map.path[i]] = [map.path[i], map.path[i - 1]]))}
              >
                &uarr;
              </button>
              <button
                type="button"
                className="admin-map-icon"
                aria-label="Move stop down"
                disabled={i === m.path.length - 1}
                onClick={() => edit((map) => ([map.path[i + 1], map.path[i]] = [map.path[i], map.path[i + 1]]))}
              >
                &darr;
              </button>
              <button type="button" className="admin-map-icon" aria-label="Remove stop" onClick={() => edit((map) => map.path.splice(i, 1))}>
                &times;
              </button>
            </div>
          ))}
          <div>
            <button
              type="button"
              className="admin-sched-cancel"
              disabled={!m.places.length}
              onClick={() => edit((map) => map.path.push(map.partyAt || map.places[0]?.id))}
            >
              + Add stop
            </button>
          </div>
        </div>
      </Panel>

      <Panel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, textTransform: 'uppercase' }}>Places · {m.places.length}</span>
          <button type="button" className="admin-sched-cancel" onClick={addPlace}>
            + Add place
          </button>
        </div>
        <div>
          {m.places.map((p, i) => {
            const lk = look(p);
            const isOpen = open === p.id;
            const isMoving = moving === p.id;
            const set = (k: 'name' | 'desc' | 'npcs' | 'rumors') => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              const v = e.target.value;
              edit((map) => (map.places[i][k] = v));
            };
            return (
              <div key={p.id} style={{ borderTop: `1px solid ${mutedInk(12)}` }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 10px', padding: '10px 0' }}>
                  <span style={{ width: 12, height: 12, flex: 'none', boxSizing: 'border-box', background: lk.fill, border: `2px ${lk.style} ${lk.ring}` }} />
                  <input
                    type="text"
                    aria-label="Place name"
                    value={p.name}
                    style={{ ...input, flex: '1 1 200px', width: 'auto', minWidth: 0 }}
                    onChange={set('name')}
                  />
                  <div style={{ display: 'flex', gap: 2, flex: 'none' }} role="group" aria-label={`Status of ${p.name}`}>
                    {STATUSES.map(([k, l]) => (
                      <button
                        key={k}
                        type="button"
                        className="admin-map-seg"
                        aria-pressed={p.status === k}
                        onClick={() => edit((map) => (map.places[i].status = k))}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="admin-map-icon"
                    aria-label={`Move pin for ${p.name}`}
                    title="Move pin"
                    aria-pressed={isMoving}
                    onClick={() => setMoving(isMoving ? null : p.id)}
                  >
                    <PinIcon />
                  </button>
                  <button
                    type="button"
                    className="admin-map-icon admin-map-chevron"
                    aria-label={isOpen ? `Collapse ${p.name}` : `Edit ${p.name}`}
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : p.id)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>
                {isOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 0 18px 22px' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={label}>Description</span>
                      <textarea rows={3} value={p.desc} style={area} onChange={set('desc')} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={label}>Notable NPCs</span>
                      <textarea rows={3} value={p.npcs} placeholder="One per line: Name — role" style={area} onChange={set('npcs')} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={label}>Rumors &amp; hooks</span>
                      <textarea rows={3} value={p.rumors} placeholder="One per line" style={area} onChange={set('rumors')} />
                    </label>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, color: mutedInk(60), fontVariantNumeric: 'tabular-nums' }}>
                        Pin at x {p.x} · y {p.y}
                      </span>
                      <button type="button" className="admin-sched-cancel" onClick={() => removePlace(p)}>
                        Remove place
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
