import { Link } from 'react-router-dom';
import type { Content, FitQuestion } from '../../content';
import { MODULES, DEFAULT_ACTIVE } from '../../classModules';
import { NumberField, OutlineAddButton, Panel, SectionHeader, TextAreaField, TextField, mutedInk } from '../fields';

const uid = () => Math.random().toString(36).slice(2, 9);

const STD_SECTIONS = [
  { n: '01', title: 'General information', desc: 'Discord, D&D experience, favourite aspects (up to 2), playstyle, lines and veils, why them.' },
  { n: '03', title: 'Vibe check', desc: 'How they bond with other players and how they want to handle conflict.' },
  { n: '04', title: 'Your character', desc: 'Name, species, class, subclass and backstory, with a live character card.' },
];

function Switch({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" style={{ all: 'unset', boxSizing: 'border-box', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, minHeight: 44 }} onClick={onClick}>
      <span style={{ width: 42, height: 24, boxSizing: 'border-box', border: `2px solid ${on ? 'var(--color-accent)' : mutedInk(40)}`, background: on ? 'var(--color-accent)' : 'transparent', position: 'relative', flex: 'none' }}>
        <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 14, height: 14, background: on ? '#ffffff' : mutedInk(60) }} />
      </span>
      <span style={{ fontSize: 15 }}>{label}</span>
    </button>
  );
}

function Checkbox({ on, size = 18 }: { on: boolean; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        boxSizing: 'border-box',
        border: `2px solid ${on ? 'var(--color-accent)' : mutedInk(45)}`,
        background: on ? 'var(--color-accent)' : 'transparent',
        display: 'grid',
        placeItems: 'center',
        color: '#ffffff',
        fontSize: size === 18 ? 12 : 10,
        fontWeight: 800,
        lineHeight: 1,
        flex: 'none',
      }}
    >
      {on ? '✓' : ''}
    </span>
  );
}

export function RegistrationSection({ draft, update }: { draft: Content; update: (fn: (c: Content) => void) => void }) {
  const reg = draft.registration;
  const dl = /^\d{4}-\d{2}-\d{2}$/.test(reg.deadline) ? new Date(`${reg.deadline}T23:59:59`) : null;
  const dlPast = !!dl && Date.now() > dl.getTime();
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dlNote = !dl
    ? 'No deadline. Applications stay open until you switch them off.'
    : dlPast
      ? 'Deadline passed. The registration page now shows applications as closed.'
      : `Applicants see this date. The page closes automatically after ${dl.getDate()} ${MONTHS[dl.getMonth()]} ${dl.getFullYear()}.`;

  const activeModules = Array.isArray(reg.modules) && reg.modules.length ? reg.modules : [];
  const modulesUnset = !reg.modules.length;

  const toggleModule = (id: string) => {
    update((c) => {
      const cur = c.registration.modules.length ? c.registration.modules.slice() : DEFAULT_ACTIVE.slice();
      const on = cur.includes(id);
      c.registration.modules = on ? cur.filter((v) => v !== id) : cur.concat(id);
    });
  };

  const addFitQ = () => {
    update((c) => {
      c.registration.fitQuestions.push({ id: uid(), type: 'choice', required: true, prompt: '', options: ['Yes', 'No'] });
    });
  };

  const updateFitQ = (i: number, fn: (q: FitQuestion) => void) => {
    update((c) => fn(c.registration.fitQuestions[i]));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionHeader
        title="Registration"
        description="Sections 01, 03 and 04 are the same for every campaign. Campaign fit is written per campaign."
        action={
          <Link
            to="/thecrookedmoon/apply"
            target="_blank"
            rel="noreferrer"
            style={{ height: 44, padding: '0 18px', display: 'inline-flex', alignItems: 'center', border: `2px solid ${mutedInk(35)}`, boxSizing: 'border-box', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-bg)' }}
          >
            Preview page
          </Link>
        }
      />

      <Panel title="Status">
        <Switch on={reg.open !== false} onClick={() => update((c) => (c.registration.open = c.registration.open === false))} label={reg.open !== false ? 'Accepting applications' : 'Applications closed'} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16 }}>
          <NumberField label="Seats open" value={reg.seats} min={1} max={8} onChange={(v) => update((c) => (c.registration.seats = v))} />
          <TextField label="Deadline · closes end of day" type="date" value={reg.deadline} onChange={(v) => update((c) => (c.registration.deadline = v))} />
        </div>
        <span style={{ fontSize: 13, color: dlPast ? 'var(--color-accent-400)' : mutedInk(60) }}>{dlNote}</span>
        <TextAreaField label="Intro on the registration page" rows={3} value={reg.intro} onChange={(v) => update((c) => (c.registration.intro = v))} />
      </Panel>

      <Panel title="Standard sections">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {STD_SECTIONS.map((ss) => (
            <div key={ss.n} style={{ display: 'grid', gridTemplateColumns: '36px minmax(0, 1fr) auto', gap: 12, alignItems: 'start', padding: '14px 0', borderTop: `1px solid ${mutedInk(12)}` }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15, color: 'var(--color-accent-400)' }}>{ss.n}</span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15, textTransform: 'uppercase' }}>{ss.title}</span>
                <span style={{ fontSize: 13, lineHeight: 1.5, color: mutedInk(65) }}>{ss.desc}</span>
              </span>
              <span style={{ border: `1px solid ${mutedInk(35)}`, padding: '2px 7px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Standard</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Character sources">
        <span style={{ fontSize: 13, lineHeight: 1.5, color: mutedInk(65), marginTop: -10 }}>
          Applicants only see species, classes and subclasses from the sources turned on here.{' '}
          {modulesUnset ? 'Nothing is on, so applicants see the defaults (PHB, TCM).' : ''}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <button
            type="button"
            aria-pressed={reg.allowHomebrew !== false}
            style={{ all: 'unset', boxSizing: 'border-box', cursor: 'pointer', display: 'grid', gridTemplateColumns: '18px 48px minmax(0, 1fr)', gap: 12, alignItems: 'center', minHeight: 52, padding: '10px 0', borderTop: `1px solid ${mutedInk(12)}` }}
            onClick={() => update((c) => (c.registration.allowHomebrew = c.registration.allowHomebrew === false))}
          >
            <Checkbox on={reg.allowHomebrew !== false} />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13, letterSpacing: '0.06em', color: 'var(--color-accent-400)' }}>HB</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Allow homebrew</span>
              <span style={{ fontSize: 12, color: mutedInk(60) }}>Adds an Other tile to species and class so applicants can name their own</span>
            </span>
          </button>
          {MODULES.map((m) => {
            const on = (activeModules.length ? activeModules : DEFAULT_ACTIVE).includes(m.id);
            const nSub = Object.values(m.classes).reduce((n, list) => n + list.length, 0);
            const count = [m.species?.length ? `${m.species.length} species` : '', `${Object.keys(m.classes).length} classes`, `${nSub} subclasses`].filter(Boolean).join(' · ');
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={on}
                style={{ all: 'unset', boxSizing: 'border-box', cursor: 'pointer', display: 'grid', gridTemplateColumns: '18px 48px minmax(0, 1fr)', gap: 12, alignItems: 'center', minHeight: 52, padding: '10px 0', borderTop: `1px solid ${mutedInk(12)}` }}
                onClick={() => toggleModule(m.id)}
              >
                <Checkbox on={on} />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13, letterSpacing: '0.06em', color: 'var(--color-accent-400)' }}>{m.abbr}</span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{m.name}</span>
                  <span style={{ fontSize: 12, color: mutedInk(60) }}>{count}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="02 · Campaign fit — this campaign only">
        <TextField label="Section title" value={reg.fitTitle} onChange={(v) => update((c) => (c.registration.fitTitle = v))} />
        <TextAreaField label="Section intro" rows={3} value={reg.fitIntro} onChange={(v) => update((c) => (c.registration.fitIntro = v))} />
        {reg.fitQuestions.map((fq, i) => (
          <div key={fq.id} style={{ background: 'var(--color-text)', border: `1px solid ${mutedInk(16)}`, padding: 'clamp(12px, 3vw, 18px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14, color: 'var(--color-accent-400)', minWidth: 32 }}>Q{i + 1}</span>
              <select
                value={fq.type}
                onChange={(e) => updateFitQ(i, (q) => (q.type = e.target.value as FitQuestion['type']))}
                style={{ boxSizing: 'border-box', height: 40, padding: '0 10px', background: 'var(--color-text)', color: 'var(--color-bg)', border: `1px solid ${mutedInk(22)}`, borderRadius: 0, fontFamily: 'var(--font-body)', fontSize: 15, outline: 'none' }}
              >
                <option value="choice">Pick one answer</option>
                <option value="text">Written answer</option>
              </select>
              <button
                type="button"
                style={{ all: 'unset', boxSizing: 'border-box', cursor: 'pointer', height: 40, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}
                onClick={() => updateFitQ(i, (q) => (q.required = !q.required))}
              >
                <Checkbox on={fq.required} size={14} />
                <span>Required</span>
              </button>
              <span style={{ flex: 1 }} />
              <button
                type="button"
                aria-label="Move up"
                disabled={i === 0}
                style={{ all: 'unset', boxSizing: 'border-box', cursor: i === 0 ? 'default' : 'pointer', width: 40, height: 40, display: 'grid', placeItems: 'center', border: `1px solid ${mutedInk(22)}`, opacity: i === 0 ? 0.3 : 1 }}
                onClick={() => {
                  if (i === 0) return;
                  update((c) => {
                    const list = c.registration.fitQuestions;
                    const [q] = list.splice(i, 1);
                    list.splice(i - 1, 0, q);
                  });
                }}
              >
                &uarr;
              </button>
              <button
                type="button"
                style={{ all: 'unset', cursor: 'pointer', minHeight: 40, padding: '0 4px', fontSize: 13, color: mutedInk(65) }}
                onClick={() => {
                  if (!window.confirm('Remove this question?')) return;
                  update((c) => c.registration.fitQuestions.splice(i, 1));
                }}
              >
                Remove
              </button>
            </div>
            <TextAreaField label="Question" rows={2} value={fq.prompt} onChange={(v) => updateFitQ(i, (q) => (q.prompt = v))} />
            {fq.type === 'choice' && (
              <TextAreaField
                label="Answers · one per line"
                rows={3}
                value={fq.options.join('\n')}
                onChange={(v) => updateFitQ(i, (q) => (q.options = v.split('\n')))}
              />
            )}
          </div>
        ))}
        <OutlineAddButton label="+ Add question" onClick={addFitQ} />
      </Panel>
    </div>
  );
}
