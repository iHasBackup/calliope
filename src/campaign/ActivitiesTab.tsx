import { Link } from 'react-router-dom';
import { PUZZLE_NUMBER, WORDS } from '../puzzle';
import type { useCampaignSite } from './useCampaignSite';

// A 7x3 decorative grid for the crossword activity card's thumbnail.
const ACTIVITY_THUMB = '.....#.#.#.#.#.....#.#.#.#.#.....';

type Props = Pick<ReturnType<typeof useCampaignSite>, 'leader' | 'entries'>;

const mutedInk = (pct: number) => `color-mix(in srgb, var(--color-bg) ${pct}%, transparent)`;

export function ActivitiesTab({ leader, entries }: Props) {
  const thumbCells = ACTIVITY_THUMB.slice(0, 21).split('');

  return (
    <div style={{ padding: 'clamp(36px, 6vw, 72px) clamp(16px, 4vw, 48px)', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent-400)' }}>
          Between sessions
        </span>
        <h1 style={{ margin: 0, fontSize: 'clamp(40px, 7vw, 88px)', lineHeight: 0.9, letterSpacing: '-0.035em', textTransform: 'uppercase' }}>
          Activities
        </h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: 16 }}>
        <div style={{ background: 'var(--panel)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div
            style={{
              position: 'relative',
              aspectRatio: '16 / 9',
              background: 'var(--color-bg)',
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 3,
              padding: 3,
              boxSizing: 'border-box',
            }}
          >
            {thumbCells.map((ch, i) => (
              <div key={i} style={{ background: ch === '#' ? 'var(--color-text)' : '#ffffff' }} />
            ))}
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={{ background: 'var(--color-accent)', color: '#ffffff', padding: '3px 7px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>
                LIVE
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent-400)' }}>
                Puzzle &middot; Crossword
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, lineHeight: 1.05, textTransform: 'uppercase' }}>
              Puzzle No. {PUZZLE_NUMBER}
            </span>
            <span style={{ fontSize: 14, lineHeight: 1.5, color: mutedInk(80) }}>
              {WORDS.length} words from the vale. No hints. Ranked by words solved, then time.
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto minmax(0, 1fr)',
                gap: '4px 12px',
                fontSize: 13,
                padding: '10px 0',
                borderTop: `1px solid ${mutedInk(14)}`,
              }}
            >
              <span style={{ color: mutedInk(60) }}>Top score</span>
              <span style={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                {leader ? `${leader.name} — ${leader.words}/${WORDS.length}` : 'No entries yet'}
              </span>
              <span style={{ color: mutedInk(60) }}>Entries</span>
              <span style={{ fontWeight: 700 }}>{entries}</span>
            </div>
            <Link
              to="/crookedmoon/crossword"
              className="btn btn-primary"
              style={{ height: 48, padding: '0 22px', color: '#ffffff', display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start', fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              Play now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
