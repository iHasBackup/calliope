import type { ApplicationDraft } from '../application';
import { blankClassEntry, type ClassEntry } from '../application';
import type { Registration } from '../content';
import { BASE, build as buildClasses, buildSpecies } from '../classModules';
import { classesOf, classOf, entryClass, speciesOf, subOf } from '../registrationData';

const muted = (pct: number) => `color-mix(in srgb, var(--color-bg) ${pct}%, transparent)`;
const tint = 'color-mix(in srgb, var(--color-accent) 16%, var(--color-text))';
const SEG: [string, string][] = [
  ['var(--color-accent)', '#ffffff'],
  ['var(--color-bg)', 'var(--color-text)'],
  ['var(--color-accent-300)', 'var(--color-text)'],
];

function tileStyle(sel: boolean) {
  return {
    border: `2px solid ${sel ? 'var(--color-accent)' : muted(18)}`,
    background: sel ? 'var(--color-accent)' : 'transparent',
    color: sel ? '#ffffff' : 'var(--color-bg)',
  };
}

function donor(l: ClassEntry[], i: number): number {
  let j = -1;
  l.forEach((e, k) => {
    if (k !== i && (e.lv || 0) > 1 && (j < 0 || (e.lv || 0) > (l[j].lv || 0))) j = k;
  });
  return j;
}

export function CharacterCard({ a, partyLevel, width }: { a: ApplicationDraft; partyLevel: number; width: number }) {
  const cls = BASE.find((k) => k.v === (classesOf(a)[0]?.klass || ''));
  const multi = !!a.multiclass && classesOf(a).length > 1 && partyLevel >= 2;
  const elist = classesOf(a).length ? classesOf(a) : [blankClassEntry()];
  const speciesName = speciesOf(a);
  const className = classOf(a);
  const subName = subOf(a);
  const monogram = (a.name.trim().charAt(0) || '?').toUpperCase();
  const hasFace = /^https?:\/\//i.test(a.faceUrl || '');
  const charChecks = [!!a.name.trim(), !!speciesName, !!className, !!a.backstory.trim()];
  const charDone = charChecks.filter(Boolean).length;
  const cHd = multi
    ? elist
        .map((e) => {
          const k = BASE.find((z) => z.v === e.klass);
          return k ? k.hd : e.klass === 'other' ? '?' : '';
        })
        .filter(Boolean)
        .join(' / ')
    : cls
      ? cls.hd
      : '—';
  const cAb = cls ? cls.ab : '—';
  const cardBorder = charDone === 4 ? 'var(--color-accent)' : muted(22);
  const wide = width >= 900;

  if (!wide) {
    return (
      <div
        style={{
          position: 'sticky',
          top: 57,
          zIndex: 5,
          width: '100%',
          padding: '10px 0',
          boxSizing: 'border-box',
          background: 'color-mix(in srgb, var(--color-text) 94%, transparent)',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${muted(12)}`,
          display: 'grid',
          gridTemplateColumns: '52px minmax(0, 1fr) auto',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div style={{ width: 52, height: 52, display: 'grid', placeItems: 'center', background: 'var(--panel)', border: `2px solid ${cardBorder}`, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26, overflow: 'hidden', position: 'relative' }}>
          {!hasFace && monogram}
          {hasFace && (
            <div className="grayscale" style={{ position: 'absolute', inset: 0 }}>
              <div role="img" aria-label="Face claim" style={{ width: '100%', height: '100%', background: `url(${JSON.stringify(a.faceUrl)}) center top / cover no-repeat` }} />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {a.name.trim() || 'Unnamed'}
          </span>
          <span style={{ fontSize: 12, color: muted(70), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {[speciesName || 'Species TBD', className || 'Class TBD'].join(' · ')}
          </span>
        </div>
        <span style={{ background: 'var(--color-accent)', color: '#ffffff', padding: '4px 8px', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 12, letterSpacing: '0.08em' }}>LV {partyLevel}</span>
      </div>
    );
  }

  return (
    <div style={{ order: 2, flex: '0 1 300px', minWidth: 260, position: 'sticky', top: 89, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ position: 'relative', aspectRatio: '3 / 4.2', background: 'var(--panel)', border: `2px solid ${cardBorder}`, overflow: 'hidden', containerType: 'inline-size' } as React.CSSProperties}>
        {!hasFace && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '72cqi', lineHeight: 1, color: muted(8), userSelect: 'none' }}>
            {monogram}
          </div>
        )}
        {hasFace && (
          <>
            <div className="grayscale" style={{ position: 'absolute', inset: 0 }}>
              <div role="img" aria-label="Face claim" style={{ width: '100%', height: '100%', background: `url(${JSON.stringify(a.faceUrl)}) center top / cover no-repeat` }} />
            </div>
            <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: '65%', pointerEvents: 'none', background: 'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--color-text) 80%, transparent) 45%, var(--color-text) 100%)' }} />
          </>
        )}
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ background: 'var(--color-accent)', color: '#ffffff', padding: '4px 8px', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 12, letterSpacing: '0.08em' }}>LV {partyLevel}</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: muted(60) }}>New recruit</span>
        </div>
        <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent-400)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {speciesName || 'Species TBD'}
          </span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(22px, 11cqi, 32px)', lineHeight: 1, letterSpacing: '-0.01em', textTransform: 'uppercase', overflowWrap: 'anywhere' }}>
            {a.name.trim() || 'Unnamed'}
          </span>
          <div style={{ display: 'flex' }}>
            <span style={{ background: 'var(--color-bg)', color: 'var(--color-text)', padding: '0 8px', lineHeight: '24px', fontSize: 12, fontWeight: 700, maxWidth: '100%', boxSizing: 'border-box', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {className || 'Class TBD'}
            </span>
          </div>
          <span style={{ fontSize: 13, color: muted(75), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subName || 'Subclass TBD'}</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginTop: 4, background: muted(16) }}>
            <div style={{ background: 'var(--panel)', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: muted(55) }}>Hit die</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18 }}>{cHd}</span>
            </div>
            <div style={{ background: 'var(--panel)', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: muted(55) }}>Primary</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, whiteSpace: 'nowrap' }}>{cAb}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          <span style={{ color: muted(60) }}>Character</span>
          <span style={{ color: 'var(--color-accent-400)' }}>{charDone} / 4</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 3 }}>
          {charChecks.map((ok, i) => (
            <div key={i} style={{ height: 8, background: ok ? 'var(--color-accent)' : muted(16) }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CharacterForm({
  a,
  setA,
  reg,
  partyLevel,
  errShown,
}: {
  a: ApplicationDraft;
  setA: (fn: (draft: ApplicationDraft) => void) => void;
  reg: Registration;
  partyLevel: number;
  errShown: Record<string, string>;
}) {
  const L = Math.max(1, partyLevel || 1);
  const multi = !!a.multiclass && L >= 2;
  const elist = classesOf(a).length ? classesOf(a) : [blankClassEntry()];
  const CL = buildClasses(reg.modules).filter((k) => k.v !== 'other' || reg.allowHomebrew !== false);
  const SPL = buildSpecies(reg.modules).concat(reg.allowHomebrew !== false ? [{ v: 'other', label: 'Other', src: 'HB' }] : []);
  const canAddClass = multi && elist.length < Math.min(3, L) && donor(elist, -1) >= 0;

  const setE = (fn: (l: ClassEntry[], x: ApplicationDraft) => void) => {
    setA((x) => {
      let l = classesOf(x).map((e) => ({ ...e }));
      if (!l.length) l = [blankClassEntry()];
      fn(l, x);
      l.forEach((e) => {
        if ((x.multiclass ? e.lv || 0 : L) < 3) {
          e.sub = '';
          e.subOther = '';
        }
      });
      x.classes = l;
      Object.assign(x, { klass: l[0].klass, klassOther: l[0].klassOther, sub: l[0].sub, subOther: l[0].subOther });
    });
  };

  const setMulti = (on: boolean) => {
    if (on && L < 2) return;
    setE((l, x) => {
      l.splice(1);
      if (on) {
        l[0].lv = L - 1;
        l.push({ ...blankClassEntry(), lv: 1 });
      } else l[0].lv = null;
      x.multiclass = on;
    });
  };

  const addClass = () =>
    setE((l) => {
      const j = donor(l, -1);
      if (j >= 0 && l.length < 3) {
        l[j].lv = (l[j].lv || 0) - 1;
        l.push({ ...blankClassEntry(), lv: 1 });
      }
    });

  return (
    <div style={{ order: 1, flex: '999 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '24px 0 28px', borderTop: `1px solid ${muted(14)}` }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13, color: 'var(--color-accent-400)' }}>01</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, textTransform: 'uppercase' }}>Name</span>
        </div>
        <input
          type="text"
          value={a.name}
          placeholder="What do they call you?"
          onChange={(e) => setA((x) => (x.name = e.target.value))}
          style={{ boxSizing: 'border-box', width: '100%', height: 60, padding: '0 16px', background: 'var(--color-text)', color: 'var(--color-bg)', border: `2px solid ${errShown.name ? 'var(--color-accent)' : muted(22)}`, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, letterSpacing: '0.01em', textTransform: 'uppercase', outline: 'none' }}
        />
        {errShown.name && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent-400)' }}>{errShown.name}</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '28px 0', borderTop: `1px solid ${muted(14)}` }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13, color: 'var(--color-accent-400)' }}>02</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, textTransform: 'uppercase' }}>Species</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 132px), 1fr))', gap: 6 }}>
          {SPL.map((t) => (
            <button
              key={t.v}
              type="button"
              aria-pressed={a.species === t.v}
              style={{ all: 'unset', boxSizing: 'border-box', minWidth: 0, cursor: 'pointer', minHeight: 64, padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8, ...tileStyle(a.species === t.v) }}
              onClick={() => setA((x) => (x.species = t.v))}
            >
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.65 }}>{t.src || ''}</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14, lineHeight: 1.15, textTransform: 'uppercase', letterSpacing: '0.01em', overflowWrap: 'anywhere' }}>{t.label}</span>
            </button>
          ))}
        </div>
        {a.species === 'other' && (
          <input
            type="text"
            value={a.speciesOther}
            placeholder="Name the species (homebrew or other book)"
            onChange={(e) => setA((x) => (x.speciesOther = e.target.value))}
            style={{ boxSizing: 'border-box', width: '100%', maxWidth: 420, height: 48, padding: '0 14px', background: 'var(--color-text)', color: 'var(--color-bg)', border: `1px solid ${muted(22)}`, fontFamily: 'var(--font-body)', fontSize: 16, outline: 'none' }}
          />
        )}
        {errShown.species && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent-400)' }}>{errShown.species}</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '28px 0', borderTop: `1px solid ${muted(14)}` }}>
        <div style={{ display: 'flex', gap: '8px 16px', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13, color: 'var(--color-accent-400)' }}>03</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, textTransform: 'uppercase' }}>Class</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: muted(50) }}>Joining at level {L}</span>
        </div>

        {L >= 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 6 }}>
            {[
              { on: false, label: 'Single class', desc: `All ${L} ${L === 1 ? 'level' : 'levels'} in one class.` },
              { on: true, label: 'Multiclass', desc: L < 2 ? `Opens from level 2. This table starts at level ${L}.` : `Split your ${L} levels across two or three classes.` },
            ].map((mo) => {
              const sel = multi === mo.on;
              const off = mo.on && L < 2;
              return (
                <button
                  key={mo.label}
                  type="button"
                  aria-pressed={sel}
                  disabled={off}
                  style={{ all: 'unset', boxSizing: 'border-box', cursor: off ? 'not-allowed' : 'pointer', opacity: off ? 0.45 : 1, minHeight: 64, padding: '14px 16px', display: 'grid', gridTemplateColumns: '12px minmax(0, 1fr)', gap: 12, alignItems: 'start', border: `2px solid ${sel ? 'var(--color-accent)' : muted(18)}`, background: sel ? tint : 'transparent' }}
                  onClick={() => !off && !sel && setMulti(mo.on)}
                >
                  <span style={{ width: 12, height: 12, marginTop: 4, boxSizing: 'border-box', border: `2px solid ${sel ? 'var(--color-accent)' : muted(45)}`, background: sel ? 'var(--color-accent)' : 'transparent', transform: 'rotate(45deg)' }} />
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{mo.label}</span>
                    <span style={{ fontSize: 13, lineHeight: 1.45, color: muted(70), textWrap: 'pretty' }}>{mo.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {multi && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              <span style={{ color: muted(60) }}>Level split</span>
              <span style={{ color: 'var(--color-accent-400)', fontVariantNumeric: 'tabular-nums' }}>{L} levels</span>
            </div>
            <div style={{ display: 'flex', gap: 3, height: 36 }}>
              {elist.map((en, i) => {
                const nm = entryClass(en);
                return (
                  <div key={i} style={{ flex: `${en.lv || 1} 1 0`, minWidth: 0, background: SEG[i][0], color: SEG[i][1], display: 'flex', alignItems: 'center', padding: '0 10px', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {'ABC'.charAt(i)} · {nm ? `${nm} ` : 'Lv '}
                    {en.lv || 1}
                  </div>
                );
              })}
            </div>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: muted(60), textWrap: 'pretty' }}>Levels always add up to {L}. Raising one class takes a level from another.</span>
          </div>
        )}

        {elist.map((en, i) => {
          const ec = CL.find((k) => k.v === en.klass) || null;
          const taken = elist.filter((_, j) => j !== i).map((o) => o.klass).filter((v) => v && v !== 'other');
          const canDec = multi && (en.lv || 0) > 1;
          const canInc = multi && donor(elist, i) >= 0;
          const subs = ec && ec.v !== 'other' ? ec.subs : [];
          const nm = entryClass(en);
          const showSub = (multi ? en.lv || 1 : L) >= 3;

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0, border: multi ? `2px solid ${muted(18)}` : 'none', padding: multi ? 14 : 0 }}>
              {multi && (
                <div style={{ display: 'grid', gridTemplateColumns: '36px minmax(0, 1fr) auto', gap: 12, alignItems: 'center' }}>
                  <span style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', background: SEG[i][0], color: SEG[i][1], fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16 }}>{'ABC'.charAt(i)}</span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: muted(55) }}>Class {'ABC'.charAt(i)}</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nm || 'Pick a class'}</span>
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                      type="button"
                      aria-label="One level less"
                      disabled={!canDec}
                      style={{ all: 'unset', boxSizing: 'border-box', width: 44, height: 44, display: 'grid', placeItems: 'center', border: `2px solid ${muted(30)}`, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, lineHeight: 1, cursor: canDec ? 'pointer' : 'not-allowed', opacity: canDec ? 1 : 0.35 }}
                      onClick={() => canDec && setE((l) => { l[i].lv = (l[i].lv || 0) - 1; l[i === 0 ? 1 : 0].lv = (l[i === 0 ? 1 : 0].lv || 0) + 1; })}
                    >
                      −
                    </button>
                    <span style={{ minWidth: 52, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: muted(55) }}>Lv</span>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{en.lv || 1}</span>
                    </span>
                    <button
                      type="button"
                      aria-label="One level more"
                      disabled={!canInc}
                      style={{ all: 'unset', boxSizing: 'border-box', width: 44, height: 44, display: 'grid', placeItems: 'center', border: `2px solid ${muted(30)}`, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, lineHeight: 1, cursor: canInc ? 'pointer' : 'not-allowed', opacity: canInc ? 1 : 0.35 }}
                      onClick={() => {
                        if (!canInc) return;
                        setE((l) => {
                          const j = donor(l, i);
                          if (j >= 0) {
                            l[j].lv = (l[j].lv || 0) - 1;
                            l[i].lv = (l[i].lv || 0) + 1;
                          }
                        });
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 140px), 1fr))', gap: 6 }}>
                {CL.map((k) => {
                  const off = taken.includes(k.v);
                  const sel = en.klass === k.v;
                  return (
                    <button
                      key={k.v}
                      type="button"
                      aria-pressed={sel}
                      aria-disabled={off}
                      disabled={off}
                      style={{ all: 'unset', boxSizing: 'border-box', minWidth: 0, cursor: off ? 'not-allowed' : 'pointer', opacity: off ? 0.35 : 1, minHeight: 88, padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10, ...tileStyle(sel) }}
                      onClick={() => {
                        if (off) return;
                        setE((l) => {
                          if (l[i].klass !== k.v) {
                            l[i].klass = k.v;
                            l[i].sub = '';
                          }
                        });
                      }}
                    >
                      <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        <span style={{ border: '1px solid currentColor', padding: '1px 5px', fontSize: 10, letterSpacing: '0.08em', opacity: 0.85 }}>{k.src || 'HB'}</span>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}>{k.hd === '—' ? '' : k.hd}</span>
                      </span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, lineHeight: 1.15, textTransform: 'uppercase', overflowWrap: 'anywhere' }}>{k.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.7, overflowWrap: 'anywhere' }}>{off ? 'Taken' : k.role} · {k.ab === '—' ? 'Homebrew or other book' : k.ab}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {en.klass === 'other' && (
                <input
                  type="text"
                  value={en.klassOther}
                  placeholder="Name the class (e.g. Blood Hunter, Death Knight)"
                  onChange={(e) => setE((l) => { l[i].klassOther = e.target.value; l[i].sub = 'other'; })}
                  style={{ boxSizing: 'border-box', width: '100%', maxWidth: 420, height: 48, padding: '0 14px', background: 'var(--color-text)', color: 'var(--color-bg)', border: `1px solid ${muted(22)}`, fontFamily: 'var(--font-body)', fontSize: 16, outline: 'none' }}
                />
              )}

              {showSub && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 14, borderTop: `1px dashed ${muted(18)}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    <span style={{ color: muted(75) }}>{multi && nm ? `${nm} subclass` : 'Subclass'}</span>
                    <span style={{ color: muted(50) }}>Optional</span>
                  </div>
                  {!en.klass && <span style={{ fontSize: 14, color: muted(60) }}>Pick a class to see its subclasses.</span>}
                  {ec && ec.v !== 'other' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 150px), 1fr))', gap: 6 }}>
                      {subs.map((s) => {
                        const sel = en.sub === s.v;
                        return (
                          <button
                            key={s.v}
                            type="button"
                            aria-pressed={sel}
                            style={{ all: 'unset', boxSizing: 'border-box', minWidth: 0, cursor: 'pointer', minHeight: 44, padding: '10px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, lineHeight: 1.2, overflowWrap: 'anywhere', ...tileStyle(sel) }}
                            onClick={() => setE((l) => { l[i].sub = l[i].sub === s.v ? '' : s.v; })}
                          >
                            {s.src && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.65 }}>{s.src}</span>}
                            <span>{s.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {en.sub === 'other' && (
                    <input
                      type="text"
                      value={en.subOther}
                      placeholder="Name the subclass"
                      onChange={(e) => setE((l) => (l[i].subOther = e.target.value))}
                      style={{ boxSizing: 'border-box', width: '100%', maxWidth: 420, height: 48, padding: '0 14px', background: 'var(--color-text)', color: 'var(--color-bg)', border: `1px solid ${muted(22)}`, fontFamily: 'var(--font-body)', fontSize: 16, outline: 'none' }}
                    />
                  )}
                </div>
              )}

              {multi && elist.length > 2 && (
                <button
                  type="button"
                  style={{ all: 'unset', boxSizing: 'border-box', cursor: 'pointer', alignSelf: 'flex-start', minHeight: 44, padding: '0 2px', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: muted(65), textDecoration: 'underline', textUnderlineOffset: '4px' }}
                  onClick={() => setE((l) => { const g = l[i].lv || 0; l.splice(i, 1); l[0].lv = (l[0].lv || 0) + g; })}
                >
                  Remove class
                </button>
              )}
            </div>
          );
        })}

        {canAddClass && (
          <button
            type="button"
            style={{ all: 'unset', boxSizing: 'border-box', cursor: 'pointer', minHeight: 52, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10, border: `2px dashed ${muted(35)}`, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}
            onClick={addClass}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
            <span>Add a third class</span>
          </button>
        )}
        {errShown.klass && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent-400)' }}>{errShown.klass}</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '28px 0', borderTop: `1px solid ${muted(14)}` }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13, color: 'var(--color-accent-400)' }}>04</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, textTransform: 'uppercase' }}>Backstory</span>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: muted(70), maxWidth: 620 }}>
          Where they come from, what they want, and what they are running from. A few paragraphs is plenty.
        </p>
        <textarea
          rows={9}
          value={a.backstory}
          onChange={(e) => setA((x) => (x.backstory = e.target.value))}
          style={{ boxSizing: 'border-box', width: '100%', padding: '12px 14px', background: 'var(--color-text)', color: 'var(--color-bg)', border: `1px solid ${errShown.backstory ? 'var(--color-accent)' : muted(22)}`, fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.6, outline: 'none', resize: 'vertical' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent-400)' }}>{errShown.backstory || ''}</span>
          <span style={{ fontSize: 12, color: muted(55), fontVariantNumeric: 'tabular-nums' }}>
            {a.backstory.trim() ? a.backstory.trim().split(/\s+/).length : 0} words
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '28px 0', borderTop: `1px solid ${muted(14)}` }}>
        <div style={{ display: 'flex', gap: '8px 16px', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13, color: 'var(--color-accent-400)' }}>05</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, textTransform: 'uppercase' }}>Face claim</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: muted(50) }}>Optional</span>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: muted(70), maxWidth: 620 }}>Paste a link to an image of how your character looks. It shows on your character card.</p>
        <input
          type="url"
          inputMode="url"
          value={a.faceUrl}
          placeholder="https://…"
          onChange={(e) => setA((x) => (x.faceUrl = e.target.value.trim()))}
          style={{ boxSizing: 'border-box', width: '100%', height: 48, padding: '0 14px', background: 'var(--color-text)', color: 'var(--color-bg)', border: `1px solid ${muted(22)}`, fontFamily: 'var(--font-body)', fontSize: 16, outline: 'none' }}
        />
        {!!a.faceUrl && !/^https?:\/\//i.test(a.faceUrl) && (
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent-400)' }}>That link does not look like a web address. It should start with https://</span>
        )}
      </div>
    </div>
  );
}

export function CharacterStep({
  a,
  setA,
  reg,
  partyLevel,
  width,
  errShown,
}: {
  a: ApplicationDraft;
  setA: (fn: (draft: ApplicationDraft) => void) => void;
  reg: Registration;
  partyLevel: number;
  width: number;
  errShown: Record<string, string>;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px, 4vw, 48px)', alignItems: 'flex-start', paddingTop: 12 }}>
      <CharacterCard a={a} partyLevel={Math.max(1, partyLevel || 1)} width={width} />
      <CharacterForm a={a} setA={setA} reg={reg} partyLevel={partyLevel} errShown={errShown} />
    </div>
  );
}
