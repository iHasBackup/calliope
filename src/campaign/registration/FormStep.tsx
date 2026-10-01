import type { ApplicationDraft } from '../application';
import type { Registration } from '../content';
import { buildSpecs, getField, getFieldArr, setField, setFieldArr, type FieldSpec } from './fieldSpecs';

const muted = (pct: number) => `color-mix(in srgb, var(--color-bg) ${pct}%, transparent)`;
const tint = 'color-mix(in srgb, var(--color-accent) 16%, var(--color-text))';

function QuestionCard({
  spec,
  index,
  a,
  setA,
  err,
}: {
  spec: FieldSpec;
  index: number;
  a: ApplicationDraft;
  setA: (fn: (draft: ApplicationDraft) => void) => void;
  err: string;
}) {
  const borderColor = err ? 'var(--color-accent)' : muted(22);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '28px 0', borderTop: `1px solid ${muted(14)}` }}>
      <div style={{ display: 'flex', gap: '8px 16px', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', minWidth: 0, flex: '1 1 280px' }}>
          {!spec.sub && (
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13, color: 'var(--color-accent-400)', fontVariantNumeric: 'tabular-nums', flex: 'none' }}>
              {String(index + 1).padStart(2, '0')}
            </span>
          )}
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(18px, 2.2vw, 22px)', lineHeight: 1.25, textWrap: 'pretty' }}>{spec.label}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: muted(50) }}>{spec.req ? 'Required' : 'Optional'}</span>
      </div>
      {spec.help && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: muted(70), maxWidth: 620, textWrap: 'pretty' }}>{spec.help}</p>}

      {spec.kind === 'input' && (
        <input
          type="text"
          value={getField(a, spec.id)}
          placeholder={spec.placeholder}
          onChange={(e) => setA((x) => setField(x, spec.id, e.target.value))}
          style={{ boxSizing: 'border-box', width: '100%', maxWidth: 420, height: 48, padding: '0 14px', background: 'var(--color-text)', color: 'var(--color-bg)', border: `1px solid ${borderColor}`, fontFamily: 'var(--font-body)', fontSize: 16, outline: 'none' }}
        />
      )}
      {spec.kind === 'area' && (
        <textarea
          rows={spec.rows || 3}
          value={getField(a, spec.id)}
          placeholder={spec.placeholder}
          onChange={(e) => setA((x) => setField(x, spec.id, e.target.value))}
          style={{ boxSizing: 'border-box', width: '100%', padding: '12px 14px', background: 'var(--color-text)', color: 'var(--color-bg)', border: `1px solid ${borderColor}`, fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.55, outline: 'none', resize: 'vertical' }}
        />
      )}
      {(spec.kind === 'single' || spec.kind === 'multi') && spec.opts && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))', gap: 8 }}>
          {spec.opts.map((o) => {
            const multi = spec.kind === 'multi';
            const currentArr = multi ? getFieldArr(a, spec.id) : [];
            const sel = multi ? currentArr.includes(o.v) : getField(a, spec.id) === o.v;
            const blocked = multi && !sel && !!spec.max && currentArr.length >= spec.max;
            return (
              <button
                key={o.v}
                type="button"
                aria-pressed={sel}
                disabled={blocked}
                style={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  cursor: blocked ? 'not-allowed' : 'pointer',
                  minHeight: 56,
                  padding: '14px 16px',
                  display: 'grid',
                  gridTemplateColumns: '14px minmax(0, 1fr)',
                  gap: 12,
                  alignItems: 'start',
                  border: `2px solid ${sel ? 'var(--color-accent)' : muted(18)}`,
                  background: sel ? tint : 'transparent',
                  opacity: blocked ? 0.45 : 1,
                }}
                onClick={() => {
                  if (blocked) return;
                  setA((x) => {
                    if (!multi) {
                      setField(x, spec.id, o.v);
                      return;
                    }
                    let cur = getFieldArr(x, spec.id).slice();
                    if (cur.includes(o.v)) cur = cur.filter((v) => v !== o.v);
                    else if (spec.exclusive && o.v === spec.exclusive) cur = [o.v];
                    else cur = cur.filter((v) => v !== spec.exclusive).concat(o.v);
                    setFieldArr(x, spec.id, cur);
                  });
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    marginTop: 4,
                    boxSizing: 'border-box',
                    border: `2px solid ${sel ? 'var(--color-accent)' : muted(45)}`,
                    background: sel ? 'var(--color-accent)' : 'transparent',
                    transform: multi ? 'none' : 'rotate(45deg)',
                  }}
                />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: o.desc ? 600 : 400, fontSize: 15, lineHeight: 1.3 }}>{o.label}</span>
                  {o.desc && <span style={{ fontSize: 13, lineHeight: 1.45, color: muted(65) }}>{o.desc}</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {err && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent-400)' }}>{err}</span>}
    </div>
  );
}

export function FormStep({
  step,
  a,
  setA,
  reg,
  errShown,
}: {
  step: number;
  a: ApplicationDraft;
  setA: (fn: (draft: ApplicationDraft) => void) => void;
  reg: Registration;
  errShown: Record<string, string>;
}) {
  const specs = buildSpecs(step, a, reg);
  let qn = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760 }}>
      {specs.map((spec) => {
        const idx = spec.sub ? qn - 1 : qn++;
        return <QuestionCard key={spec.id} spec={spec} index={idx} a={a} setA={setA} err={errShown[spec.id] || ''} />;
      })}
    </div>
  );
}
