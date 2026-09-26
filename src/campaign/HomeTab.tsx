import type { CSSProperties } from 'react';
import { CAMPAIGN, PARTY, RECAPS } from './data';
import { PlaceholderImage } from './PlaceholderImage';
import { SwordsIcon } from './SwordsIcon';
import type { useCampaignSite } from './useCampaignSite';

type Props = Pick<ReturnType<typeof useCampaignSite>, 'go' | 'session' | 'countdown'>;

const mutedInk = (pct: number) => `color-mix(in srgb, var(--color-bg) ${pct}%, transparent)`;
const RECAPS_LENGTH = RECAPS.length;

export function HomeTab({ go, session, countdown }: Props) {
  const progress = Math.min(100, Math.max(0, CAMPAIGN.progress));
  const filled = Math.round(progress / 5);
  const segments = Array.from({ length: 20 }, (_, i) => i < filled);
  const nextSessionNo = 'S' + String(RECAPS_LENGTH + 1).padStart(2, '0');

  const party = PARTY.map((p) => ({
    ...p,
    border: 'transparent',
    badge: `LV ${CAMPAIGN.partyLevel}`,
  }));
  if (CAMPAIGN.showOpenSeat) {
    party.push({
      id: 'open-seat',
      name: 'Seat open',
      species: 'Fifth player',
      klass: 'Joining soon',
      sub: 'Class TBD',
      border: mutedInk(25),
      badge: '+1',
    } as (typeof party)[number]);
  }

  return (
    <div>
      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative', width: '100%', height: 'clamp(200px, 32vw, 400px)' }}>
          <PlaceholderImage url={CAMPAIGN.keyArtUrl} label="Campaign key art" />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '45%',
              pointerEvents: 'none',
              background: 'linear-gradient(180deg, transparent, var(--color-text))',
            }}
          />
        </div>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 32,
            padding: 'clamp(20px, 3vw, 32px) clamp(16px, 4vw, 48px) clamp(28px, 4vw, 44px)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720, flex: '1 1 320px', minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  background: 'var(--color-accent)',
                  color: '#ffffff',
                  padding: '5px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                Current arc
              </span>
              <span
                style={{
                  border: `1px solid ${mutedInk(40)}`,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                {CAMPAIGN.arcChapter}
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(38px, 8vw, 104px)',
                overflowWrap: 'break-word',
                lineHeight: 0.9,
                letterSpacing: '-0.035em',
                textTransform: 'uppercase',
                textWrap: 'balance',
              }}
            >
              {CAMPAIGN.arcTitle}
            </h1>
            <p style={{ margin: 0, fontSize: 'clamp(15px, 1.6vw, 18px)', lineHeight: 1.55, maxWidth: 560, color: mutedInk(85), textWrap: 'pretty' }}>
              {CAMPAIGN.arcBlurb}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4 }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ height: 48, padding: '0 22px', fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}
                onClick={() => go('recaps')}
              >
                Catch up on recaps
              </button>
              <button type="button" className="campaign-outline-btn" onClick={() => go('activities')}>
                Play activities
              </button>
            </div>
          </div>

          <div
            style={{
              background: 'var(--color-accent)',
              color: '#ffffff',
              padding: 24,
              width: 'min(100%, 320px)',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              Next session &middot; {nextSessionNo}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 64, lineHeight: 0.9, fontVariantNumeric: 'tabular-nums' }}>
                  {countdown.days}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Days</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 64, lineHeight: 0.9, fontVariantNumeric: 'tabular-nums' }}>
                  {countdown.hours}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Hours</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.4)', paddingTop: 10, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>
              {session.dateLabel} &middot; {session.timeLabel} {CAMPAIGN.schedule.label}
            </div>
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ padding: '0 clamp(16px, 4vw, 48px)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: '1 1 150px', minWidth: 0, boxSizing: 'border-box', background: 'var(--panel)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="campaign-moon" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: mutedInk(65) }}>
                In-game night
              </span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 34, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {String(CAMPAIGN.nights).padStart(2, '0')}
              </span>
            </div>
          </div>
          <div style={{ flex: '1 1 150px', minWidth: 0, boxSizing: 'border-box', background: 'var(--panel)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <SwordsIcon />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: mutedInk(65) }}>
                Party level
              </span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 34, lineHeight: 1 }}>Lv. {CAMPAIGN.partyLevel}</span>
            </div>
          </div>
          <div style={{ flex: '2 1 300px', minWidth: 0, boxSizing: 'border-box', background: 'var(--panel)', padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: mutedInk(65) }}>
                Campaign progress
              </span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, lineHeight: 1, color: 'var(--color-accent)', fontVariantNumeric: 'tabular-nums' }}>
                {progress}%
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20, minmax(0, 1fr))', gap: 3 }}>
              {segments.map((on, i) => (
                <div key={i} style={{ height: 14, background: on ? 'var(--color-accent)' : mutedInk(14) }} />
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '4px 12px', fontSize: 12, color: mutedInk(60) }}>
              <span>{CAMPAIGN.arcChapter} of the adventure</span>
              <span>{RECAPS_LENGTH} sessions played</span>
            </div>
          </div>
        </div>
      </div>

      {/* The party */}
      <div style={{ padding: 'clamp(48px, 7vw, 88px) clamp(16px, 4vw, 48px) 0', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent-400)' }}>
              {PARTY.length} adventurers{CAMPAIGN.showOpenSeat ? ' · 1 joining' : ''}
            </span>
            <h2 style={{ margin: 0, fontSize: 'clamp(30px, 4.5vw, 52px)', lineHeight: 0.95, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              The party
            </h2>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 148px), 1fr))', gap: 'clamp(10px, 2vw, 14px)' }}>
          {party.map((p) => (
            <div
              key={p.id}
              style={{
                position: 'relative',
                containerType: 'inline-size',
                aspectRatio: '3 / 4.2',
                background: 'var(--panel)',
                border: `2px solid ${p.border}`,
                overflow: 'hidden',
              } as CSSProperties}
            >
              <PlaceholderImage url={p.portraitUrl} label={`Portrait of ${p.name}`} />
              <div
                style={{
                  position: 'absolute',
                  inset: 'auto 0 0 0',
                  height: '62%',
                  pointerEvents: 'none',
                  background:
                    'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--color-text) 80%, transparent) 45%, var(--color-text) 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  background: p.id === 'open-seat' ? mutedInk(25) : 'var(--color-accent)',
                  color: '#ffffff',
                  padding: '4px 8px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: '0.08em',
                }}
              >
                {p.badge}
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 'clamp(10px, 2.4vw, 14px)',
                  right: 'clamp(10px, 2.4vw, 14px)',
                  bottom: 'clamp(10px, 2.4vw, 14px)',
                  display: 'grid',
                  gridTemplateRows: '16px 30px 24px 18px',
                  gap: 6,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--color-accent-400)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {p.species}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: 'clamp(18px, 13cqi, 26px)',
                    lineHeight: '30px',
                    letterSpacing: '-0.01em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {p.name}
                </div>
                <div style={{ display: 'flex', minWidth: 0 }}>
                  <span
                    style={{
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      padding: '0 8px',
                      lineHeight: '24px',
                      fontSize: 12,
                      fontWeight: 700,
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {p.klass}
                  </span>
                </div>
                <div style={{ fontSize: 13, lineHeight: '18px', color: mutedInk(75), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story + quest log */}
      <div
        style={{
          padding: 'clamp(48px, 7vw, 88px) clamp(16px, 4vw, 48px) clamp(56px, 8vw, 96px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
          gap: 'clamp(28px, 5vw, 56px)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent-400)' }}>
            Nights 1&ndash;{CAMPAIGN.nights}
          </span>
          <h2 style={{ margin: 0, fontSize: 'clamp(30px, 4.5vw, 52px)', lineHeight: 0.95, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            The story so far
          </h2>
          {CAMPAIGN.summary.map((p, i) => (
            <p key={i} style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: mutedInk(85), textWrap: 'pretty' }}>
              {p}
            </p>
          ))}
        </div>
        <div style={{ background: 'var(--panel)', padding: 'clamp(20px, 3vw, 28px)', display: 'flex', flexDirection: 'column', gap: 14, alignSelf: 'start', borderTop: '3px solid var(--color-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Quest log
            </span>
            <span style={{ fontSize: 12, color: mutedInk(60) }}>{CAMPAIGN.threads.length} active</span>
          </div>
          {CAMPAIGN.threads.map((text, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '18px minmax(0, 1fr)',
                gap: 12,
                alignItems: 'start',
                paddingTop: 12,
                borderTop: `1px solid ${mutedInk(14)}`,
              }}
            >
              <span className="campaign-diamond" style={{ marginTop: 5 }} />
              <span style={{ fontSize: 15, lineHeight: 1.5, textWrap: 'pretty' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
