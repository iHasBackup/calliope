import { SwordsIcon } from './SwordsIcon';
import type { useCampaignSite } from './useCampaignSite';

type Props = Pick<ReturnType<typeof useCampaignSite>, 'go' | 'session' | 'countdown' | 'content' | 'partyColumns' | 'width'>;

const mutedInk = (pct: number) => `color-mix(in srgb, var(--color-bg) ${pct}%, transparent)`;

export function HomeTab({ go, session, countdown, content, partyColumns, width }: Props) {
  const progress = Math.min(100, Math.max(0, content.progress));
  const filled = Math.round(progress / 5);
  const segments = Array.from({ length: 20 }, (_, i) => i < filled);
  const nextSessionNo = 'S' + String(content.recaps.length + 1).padStart(2, '0');
  const summaryParagraphs = content.summary.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const activeThreads = content.threads.map((t) => t.trim()).filter(Boolean);

  const party = content.party.map((p) => ({
    ...p,
    name: p.name.trim() || 'Unnamed',
    species: p.species.trim() || 'Species TBD',
    klass: p.klass.trim() || 'Class TBD',
    sub: p.sub.trim() || 'Subclass TBD',
    border: 'transparent',
    badge: `LV ${content.partyLevel}`,
    isOpenSeat: false,
  }));
  if (content.showOpenSeat) {
    party.push({
      id: 'open-seat',
      name: 'Seat open',
      species: 'Fifth player',
      klass: 'Joining soon',
      sub: 'Class TBD',
      portraitUrl: '',
      border: mutedInk(25),
      badge: '+1',
      isOpenSeat: true,
    });
  }

  return (
    <div>
      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          className="grayscale"
          style={{
            position: 'relative',
            width: '100%',
            height: 'clamp(200px, 32vw, 400px)',
            background: content.keyArtUrl
              ? `center / cover no-repeat url(${JSON.stringify(content.keyArtUrl)})`
              : mutedInk(10),
          }}
        >
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
            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                flexWrap: 'wrap',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ width: 8, height: 8, flex: 'none', background: 'var(--color-accent)', transform: 'rotate(45deg)' }} />
              <span style={{ color: 'var(--color-accent-400)' }}>Current arc</span>
              <span style={{ color: mutedInk(45) }}>/</span>
              <span style={{ color: mutedInk(80) }}>{content.arcChapter}</span>
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
              {content.arcTitle}
            </h1>
            <p style={{ margin: 0, fontSize: 'clamp(15px, 1.6vw, 18px)', lineHeight: 1.55, maxWidth: 560, color: mutedInk(85), textWrap: 'pretty' }}>
              {content.arcBlurb}
            </p>
            <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 10px)', flexWrap: 'nowrap', paddingTop: 4 }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  height: 48,
                  padding: '0 clamp(12px, 3.4vw, 22px)',
                  fontSize: 'clamp(11px, 3.3vw, 14px)',
                  letterSpacing: 'clamp(0.02em, 0.4vw, 0.06em)',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  flex: '0 1 auto',
                  minWidth: 0,
                }}
                onClick={() => go('recaps')}
              >
                Catch up on recaps
              </button>
              <button
                type="button"
                className="campaign-outline-btn"
                style={{
                  padding: '0 clamp(12px, 3.4vw, 22px)',
                  fontSize: 'clamp(11px, 3.3vw, 14px)',
                  letterSpacing: 'clamp(0.02em, 0.4vw, 0.06em)',
                  whiteSpace: 'nowrap',
                  flex: '0 1 auto',
                  minWidth: 0,
                }}
                onClick={() => go('activities')}
              >
                Play activities
              </button>
            </div>
          </div>

          <div
            style={{
              background: 'var(--color-accent)',
              color: '#ffffff',
              padding: 'clamp(16px, 4vw, 24px)',
              width: width < 640 ? '100%' : 'min(100%, 320px)',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(10px, 2.5vw, 14px)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              Next session &middot; {nextSessionNo}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(10px, 3vw, 14px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(40px, 11vw, 64px)', lineHeight: 0.9, fontVariantNumeric: 'tabular-nums' }}>
                  {countdown.days}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Days</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(40px, 11vw, 64px)', lineHeight: 0.9, fontVariantNumeric: 'tabular-nums' }}>
                  {countdown.hours}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Hours</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.4)', paddingTop: 'clamp(8px, 2vw, 10px)', fontSize: 'clamp(13px, 3.6vw, 14px)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {session.dateLabel} &middot; {session.timeLabel} {content.schedule.label}
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
                {String(content.nights).padStart(2, '0')}
              </span>
            </div>
          </div>
          <div style={{ flex: '1 1 150px', minWidth: 0, boxSizing: 'border-box', background: 'var(--panel)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <SwordsIcon />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: mutedInk(65) }}>
                Party level
              </span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 34, lineHeight: 1 }}>Lv. {content.partyLevel}</span>
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
              <span>{content.arcChapter} of the adventure</span>
              <span>{content.recaps.length} sessions played</span>
            </div>
          </div>
        </div>
      </div>

      {/* The party */}
      <div style={{ padding: 'clamp(48px, 7vw, 88px) clamp(16px, 4vw, 48px) 0', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent-400)' }}>
              {content.party.length} adventurers{content.showOpenSeat ? ' · 1 joining' : ''}
            </span>
            <h2 style={{ margin: 0, fontSize: 'clamp(30px, 4.5vw, 52px)', lineHeight: 0.95, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              The party
            </h2>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${partyColumns}, minmax(0, 1fr))`, gap: 'clamp(10px, 1.6vw, 20px)' }}>
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
              }}
            >
              {p.portraitUrl && (
                <div
                  className="grayscale"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `center / cover no-repeat url(${JSON.stringify(p.portraitUrl)})`,
                  }}
                />
              )}
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
                  background: p.isOpenSeat ? mutedInk(25) : 'var(--color-accent)',
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
                    fontSize: 'clamp(18px, 12cqi, 30px)',
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
            Nights 1&ndash;{content.nights}
          </span>
          <h2 style={{ margin: 0, fontSize: 'clamp(30px, 4.5vw, 52px)', lineHeight: 0.95, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            The story so far
          </h2>
          {summaryParagraphs.map((p, i) => (
            <p key={i} style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: mutedInk(85), textWrap: 'pretty' }}>
              {p}
            </p>
          ))}
        </div>
        {activeThreads.length > 0 && (
          <div style={{ background: 'var(--panel)', padding: 'clamp(20px, 3vw, 28px)', display: 'flex', flexDirection: 'column', gap: 14, alignSelf: 'start', borderTop: '3px solid var(--color-accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                Quest log
              </span>
              <span style={{ fontSize: 12, color: mutedInk(60) }}>{activeThreads.length} active</span>
            </div>
            {activeThreads.map((text, i) => (
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
        )}
      </div>
    </div>
  );
}
