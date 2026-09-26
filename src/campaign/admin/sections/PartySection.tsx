import type { Content, PartyMember } from '../../content';
import { FieldRow, OutlineAddButton, SectionHeader, TextField, mutedInk } from '../fields';

export function PartySection({
  draft,
  update,
  removeMember,
  addMember,
}: {
  draft: Content;
  update: (fn: (c: Content) => void) => void;
  removeMember: (i: number, member: PartyMember) => void;
  addMember: () => void;
}) {
  const seatOn = draft.showOpenSeat;
  const note = `${draft.party.length} ${draft.party.length === 1 ? 'member' : 'members'}${seatOn ? ' · open seat shown' : ''}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionHeader title="Party" description={note} action={<OutlineAddButton label="+ Add member" onClick={addMember} />} />

      <button
        type="button"
        style={{ all: 'unset', boxSizing: 'border-box', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, minHeight: 44 }}
        onClick={() => update((c) => (c.showOpenSeat = !c.showOpenSeat))}
      >
        <span
          style={{
            width: 42,
            height: 24,
            boxSizing: 'border-box',
            border: `2px solid ${seatOn ? 'var(--color-accent)' : mutedInk(40)}`,
            background: seatOn ? 'var(--color-accent)' : 'transparent',
            position: 'relative',
            flex: 'none',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 3,
              left: seatOn ? 21 : 3,
              width: 14,
              height: 14,
              background: seatOn ? '#ffffff' : mutedInk(60),
            }}
          />
        </span>
        <span style={{ fontSize: 15 }}>Show an open seat card for a player who is joining</span>
      </button>

      {draft.party.map((m, i) => {
        const initial = (m.name || '?').trim().charAt(0).toUpperCase() || '?';
        return (
          <div key={m.id} style={{ background: 'var(--panel)', padding: 'clamp(16px, 3vw, 24px)', display: 'grid', gridTemplateColumns: '88px minmax(0, 1fr)', gap: 18 }}>
            <div
              style={{
                width: 88,
                aspectRatio: '3 / 4',
                background: 'var(--color-text)',
                border: `1px solid ${mutedInk(18)}`,
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
              }}
            >
              {m.portraitUrl ? (
                <div
                  role="img"
                  aria-label="Portrait"
                  className="grayscale"
                  style={{ width: '100%', height: '100%', background: `center / cover no-repeat url(${JSON.stringify(m.portraitUrl)})` }}
                />
              ) : (
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, color: mutedInk(40) }}>{initial}</span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent-400)' }}>
                  Member {String(i + 1).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  className="admin-text-link"
                  style={{ all: 'unset', cursor: 'pointer', minHeight: 32, padding: '0 4px', fontSize: 13, color: mutedInk(65) }}
                  onClick={() => removeMember(i, m)}
                >
                  Remove
                </button>
              </div>
              <FieldRow>
                <TextField label="Name" value={m.name} onChange={(v) => update((c) => (c.party[i].name = v))} />
                <TextField label="Species" value={m.species} onChange={(v) => update((c) => (c.party[i].species = v))} />
                <TextField label="Class" value={m.klass} onChange={(v) => update((c) => (c.party[i].klass = v))} />
                <TextField label="Subclass" value={m.sub} onChange={(v) => update((c) => (c.party[i].sub = v))} />
              </FieldRow>
              <TextField
                label="Portrait image URL"
                type="url"
                placeholder="https://…"
                value={m.portraitUrl}
                onChange={(v) => update((c) => (c.party[i].portraitUrl = v))}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
