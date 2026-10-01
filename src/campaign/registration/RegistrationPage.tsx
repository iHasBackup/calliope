import { Link } from 'react-router-dom';
import '../campaign.css';
import { useDarkBody } from '../useDarkBody';
import { useRegistration, computeErrors, activeFitQuestions } from './useRegistration';
import { FormStep } from './FormStep';
import { CharacterStep } from './CharacterStep';
import { RegistrationSkeleton } from './RegistrationSkeleton';
import { summarize } from '../registrationData';

const muted = (pct: number) => `color-mix(in srgb, var(--color-bg) ${pct}%, transparent)`;
const DAYS = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function PageHeader({ hasDraft, showDraftNote, width }: { hasDraft: boolean; showDraftNote: boolean; width: number }) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '6px clamp(10px, 4vw, 48px)',
        minHeight: 57,
        boxSizing: 'border-box',
        background: 'color-mix(in srgb, var(--color-text) 92%, transparent)',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${muted(12)}`,
      }}
    >
      <Link to="/thecrookedmoon" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, color: 'var(--color-bg)' }}>
        <div style={{ width: 28, height: 28, flex: 'none', display: 'grid', placeItems: 'center', background: 'var(--color-accent)', color: '#ffffff', borderRadius: 6, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, lineHeight: 1 }}>C</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(12px, 3.9vw, 16px)', letterSpacing: 'clamp(0.02em, 0.5vw, 0.08em)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>The Crooked Moon</div>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 'none' }}>
        {showDraftNote && hasDraft && <span style={{ fontSize: 12, color: muted(55) }}>Draft saved on this device</span>}
        <Link to="/thecrookedmoon" style={{ height: 44, display: 'flex', alignItems: 'center', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: muted(75) }}>
          {width < 560 ? 'Exit' : 'Back to campaign'}
        </Link>
      </div>
    </div>
  );
}

export default function RegistrationPage() {
  const reg = useRegistration();
  useDarkBody();

  const r = reg.reg;
  const c = reg.content;
  const dl = /^\d{4}-\d{2}-\d{2}$/.test(r.deadline) ? new Date(`${r.deadline}T23:59:59`) : null;
  const past = !!dl && Date.now() > dl.getTime();
  const failed = reg.contentError;
  const open = !failed && r.open !== false && !past;
  const daysLeft = dl ? Math.ceil((dl.getTime() - Date.now()) / 86400000) : 0;
  const seats = Math.max(1, Number(r.seats) || 1);

  const isIntro = reg.view === 'intro' || (!open && reg.view !== 'done');
  const isForm = open && reg.view === 'form';
  const isReview = open && reg.view === 'review';
  const isDone = reg.view === 'done';

  const titles = ['General information', r.fitTitle || 'Campaign fit', 'Vibe check', 'Your character'];
  const intros = [
    'Who you are as a player and what you want from the table.',
    r.fitIntro || '',
    'A campaign this long depends on how well the players get along.',
    'Build the character you want to bring. Nothing here is final until session zero.',
  ];
  const hasRail = reg.width >= 1200;
  const sch = c.schedule;
  const hh = sch.hour ?? 19;
  const scheduleText = `${DAYS[sch.weekday ?? 3]}, ${hh % 12 || 12}:00 ${hh < 12 ? 'AM' : 'PM'}${sch.timezone ? ` ${sch.label}` : ''}`;

  const overview = [
    { n: '01', title: titles[0], desc: 'Discord, experience, what you enjoy, playstyle, lines and veils.' },
    { n: '02', title: titles[1], desc: 'Commitment and the themes this campaign deals in.' },
    { n: '03', title: titles[2], desc: 'How you bond with other players and handle conflict.' },
    { n: '04', title: titles[3], desc: 'Name, species, class, subclass and backstory.' },
  ];

  const stepsNav = titles.map((t, i) => {
    const cur = i === reg.step;
    const reach = i <= reg.maxStep;
    const ok = reach && !cur && Object.keys(computeErrors(i, reg.a, r)).length === 0;
    return { n: String(i + 1).padStart(2, '0'), title: t, cur, reach, ok };
  });

  const nErr = Object.keys(reg.errors).length;
  const tried = !!reg.tried[reg.step];
  const nextTitle = reg.step < 3 ? titles[reg.step + 1] : '';

  const summary = summarize({ ...reg.a, fitSnapshot: activeFitQuestions(r).map((q) => ({ id: q.id, prompt: q.prompt })) }, r);

  if (reg.contentLoading) {
    return (
      <div className="campaign-site">
        <PageHeader hasDraft={false} showDraftNote={false} width={reg.width} />
        <RegistrationSkeleton />
      </div>
    );
  }

  return (
    <div className="campaign-site" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PageHeader hasDraft={reg.hasDraft} showDraftNote={reg.view === 'form' && reg.width >= 900} width={reg.width} />

      {isIntro && (
        <div style={{ padding: 'clamp(40px, 7vw, 96px) clamp(16px, 4vw, 48px) clamp(56px, 8vw, 96px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 'clamp(36px, 6vw, 80px)', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent-400)' }}>
              <span style={{ width: 8, height: 8, flex: 'none', background: 'var(--color-accent)', transform: 'rotate(45deg)' }} />
              <span>{open ? `Applications open · ${seats} ${seats === 1 ? 'seat' : 'seats'}` : failed ? 'Connection problem' : 'Applications closed'}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(44px, 8vw, 104px)', lineHeight: 0.9, letterSpacing: '-0.035em', textTransform: 'uppercase', textWrap: 'balance' }}>
              {open ? 'Apply for a seat' : failed ? "Can't load right now" : 'The table is full'}
            </h1>
            <p style={{ margin: 0, fontSize: 'clamp(15px, 1.6vw, 18px)', lineHeight: 1.6, maxWidth: 560, color: muted(85), textWrap: 'pretty' }}>
              {open
                ? r.intro
                : failed
                  ? 'We could not load the application details. Check your connection.'
                  : past
                  ? `Applications closed on ${dl!.getDate()} ${MONTHS[dl!.getMonth()]} ${dl!.getFullYear()}. Thanks to everyone who applied. Keep an eye on the campaign page for the next opening.`
                  : 'The DM is not taking new players right now. Check back after the current arc.'}
              {failed && (
                <>
                  {' '}
                  <button type="button" onClick={reg.retryContent} style={{ all: 'unset', cursor: 'pointer', color: 'var(--color-accent-400)', textDecoration: 'underline' }}>
                    Try again
                  </button>
                </>
              )}
            </p>

            {open && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
                  {dl && (
                    <div style={{ background: 'var(--panel)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px 16px', borderLeft: '3px solid var(--color-accent)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: muted(65) }}>Apply by</span>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18 }}>
                          {dl.getDate()} {MONTHS[dl.getMonth()]} {dl.getFullYear()}
                        </span>
                      </div>
                      <div style={{ background: 'var(--color-accent)', color: '#ffffff', minWidth: 96, padding: '10px 14px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 40, lineHeight: 0.9, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{daysLeft <= 1 ? 'Today' : daysLeft}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{daysLeft <= 1 ? 'Closes at midnight' : 'Days left'}</span>
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12 }}>
                    <div style={{ background: 'var(--panel)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: muted(65) }}>Sessions</span>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18 }}>{scheduleText}</span>
                    </div>
                    <div style={{ background: 'var(--panel)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: muted(65) }}>You join at</span>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18 }}>Level {c.partyLevel}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-primary" style={{ height: 52, padding: '0 24px', fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }} onClick={reg.begin}>
                    {reg.hasDraft ? 'Continue application' : 'Begin application'}
                  </button>
                  {reg.hasDraft && (
                    <button
                      type="button"
                      style={{ all: 'unset', boxSizing: 'border-box', cursor: 'pointer', height: 52, padding: '0 20px', display: 'flex', alignItems: 'center', border: `2px solid ${muted(35)}`, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}
                      onClick={reg.startOver}
                    >
                      Start over
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {open && (
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '3px solid var(--color-accent)', background: 'var(--panel)' }}>
              <div style={{ padding: '18px 20px 6px', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Four sections</div>
              {overview.map((ov) => (
                <div key={ov.n} style={{ display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr)', gap: 12, padding: '16px 20px', borderTop: `1px solid ${muted(12)}` }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, lineHeight: 1, color: 'var(--color-accent-400)', fontVariantNumeric: 'tabular-nums' }}>{ov.n}</span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, textTransform: 'uppercase' }}>{ov.title}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.5, color: muted(70) }}>{ov.desc}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isForm && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 'clamp(24px, 4vw, 56px)', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 48px) 40px' }}>
            {hasRail && (
              <div style={{ width: 240, flex: 'none', position: 'sticky', top: 89, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: muted(55), paddingBottom: 10 }}>Application</span>
                {stepsNav.map((st, i) => (
                  <button
                    key={st.n}
                    type="button"
                    disabled={!st.reach}
                    style={{ all: 'unset', boxSizing: 'border-box', cursor: st.reach ? 'pointer' : 'default', minHeight: 52, padding: '0 14px', display: 'grid', gridTemplateColumns: '30px minmax(0, 1fr) 16px', gap: 8, alignItems: 'center', background: st.cur ? 'var(--color-accent)' : 'transparent', color: st.cur ? '#ffffff' : st.reach ? 'var(--color-bg)' : muted(45) }}
                    onClick={() => st.reach && reg.goStep(i)}
                  >
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{st.n}</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.title}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{st.ok ? '✓' : ''}</span>
                  </button>
                ))}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {!hasRail && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 4 }}>
                    {stepsNav.map((st, i) => (
                      <div key={i} style={{ height: 6, background: i < reg.step || st.cur ? 'var(--color-accent)' : muted(16) }} />
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 12, maxWidth: 760 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent-400)' }}>Section {String(reg.step + 1).padStart(2, '0')} of 04</span>
                <h2 style={{ margin: 0, fontSize: 'clamp(34px, 5.5vw, 64px)', lineHeight: 0.92, letterSpacing: '-0.03em', textTransform: 'uppercase', textWrap: 'balance' }}>{titles[reg.step]}</h2>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: muted(78), textWrap: 'pretty' }}>{intros[reg.step]}</p>
              </div>

              {reg.step < 3 ? (
                <FormStep step={reg.step} a={reg.a} setA={reg.setA} reg={r} errShown={reg.errShown} />
              ) : (
                <CharacterStep a={reg.a} setA={reg.setA} reg={r} partyLevel={c.partyLevel} width={reg.width} errShown={reg.errShown} />
              )}
            </div>
          </div>

          <div
            style={{
              position: 'sticky',
              bottom: 0,
              zIndex: 10,
              background: 'color-mix(in srgb, var(--color-text) 95%, transparent)',
              backdropFilter: 'blur(8px)',
              borderTop: `2px solid ${muted(16)}`,
              padding: '12px clamp(16px, 4vw, 48px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: tried && nErr ? 'var(--color-accent-400)' : muted(60), flex: '1 1 160px', minWidth: 0 }}>
              {tried && nErr
                ? `${nErr} ${nErr === 1 ? 'answer needs' : 'answers need'} attention`
                : reg.width >= 640
                  ? `${titles[reg.step]} · ${reg.step + 1} of 4`
                  : `${reg.step + 1} of 4`}
            </span>
            <div style={{ display: 'flex', gap: 8, flex: '0 1 auto', marginLeft: 'auto' }}>
              <button type="button" style={{ all: 'unset', boxSizing: 'border-box', cursor: 'pointer', height: 48, padding: '0 18px', display: 'flex', alignItems: 'center', border: `2px solid ${muted(35)}`, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' }} onClick={reg.back}>
                Back
              </button>
              <button type="button" className="btn btn-primary" style={{ height: 48, padding: '0 22px', fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }} onClick={reg.next}>
                {reg.step === 3 ? 'Review' : reg.width >= 640 ? `Next: ${nextTitle}` : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isReview && (
        <div style={{ padding: 'clamp(32px, 6vw, 72px) clamp(16px, 4vw, 48px) clamp(56px, 8vw, 96px)', display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 900 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent-400)' }}>Final check</span>
            <h1 style={{ margin: 0, fontSize: 'clamp(38px, 7vw, 80px)', lineHeight: 0.9, letterSpacing: '-0.035em', textTransform: 'uppercase' }}>Review your application</h1>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: muted(78) }}>Nothing is sent until you submit.</p>
          </div>
          {summary.map((sec) => (
            <div key={sec.n} style={{ background: 'var(--panel)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '14px clamp(14px, 3vw, 20px)', borderBottom: `2px solid ${muted(14)}` }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', minWidth: 0 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14, color: 'var(--color-accent-400)' }}>{sec.n}</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, textTransform: 'uppercase' }}>{sec.title}</span>
                </div>
                <button type="button" style={{ all: 'unset', cursor: 'pointer', minHeight: 44, padding: '0 4px', display: 'flex', alignItems: 'center', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent-400)' }} onClick={() => reg.goStep(sec.step)}>
                  Edit
                </button>
              </div>
              {sec.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', padding: '12px clamp(14px, 3vw, 20px)', borderBottom: `1px solid ${muted(8)}` }}>
                  <span style={{ flex: '1 1 180px', maxWidth: 240, fontSize: 13, lineHeight: 1.5, color: muted(60), textWrap: 'pretty' }}>{it.q}</span>
                  <span style={{ flex: '999 1 280px', minWidth: 0, fontSize: 15, lineHeight: 1.55, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: it.empty ? muted(40) : 'var(--color-bg)' }}>{it.a}</span>
                </div>
              ))}
            </div>
          ))}
          {reg.submitError && <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-accent-400)' }}>{reg.submitError}</span>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" style={{ height: 52, padding: '0 24px', fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: reg.submitting ? 0.6 : 1 }} disabled={reg.submitting} onClick={reg.submit}>
              {reg.submitting ? 'Submitting…' : 'Submit application'}
            </button>
            <button
              type="button"
              style={{ all: 'unset', boxSizing: 'border-box', cursor: 'pointer', height: 52, padding: '0 20px', display: 'flex', alignItems: 'center', border: `2px solid ${muted(35)}`, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}
              onClick={reg.backToForm}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {isDone && (
        <div style={{ padding: 'clamp(48px, 10vw, 120px) clamp(16px, 4vw, 48px)', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent-400)' }}>
            <span style={{ width: 8, height: 8, flex: 'none', background: 'var(--color-accent)', transform: 'rotate(45deg)' }} />
            <span>Application sent</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 'clamp(44px, 8vw, 96px)', lineHeight: 0.9, letterSpacing: '-0.035em', textTransform: 'uppercase', textWrap: 'balance' }}>
            {reg.sentName ? `${reg.sentName} is on the list` : 'Your application is in'}
          </h1>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: muted(82), textWrap: 'pretty' }}>
            The DM reads every application and will reply to {reg.sentDiscord || 'you'} on Discord.
          </p>
          <Link to="/thecrookedmoon" className="btn btn-primary" style={{ alignSelf: 'flex-start', height: 52, padding: '0 24px', display: 'inline-flex', alignItems: 'center', color: '#ffffff', fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Back to the campaign
          </Link>
        </div>
      )}
    </div>
  );
}
