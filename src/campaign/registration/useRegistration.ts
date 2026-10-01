import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Registration } from '../content';
import { type ApplicationDraft, blankApplication } from '../application';
import { VIBE_QS, classesOf } from '../registrationData';
import { useContent } from '../useContent';

const DRAFT_KEY = 'cm-registration-draft-v1';

export type RegView = 'intro' | 'form' | 'review' | 'done';

interface StoredDraft {
  a: ApplicationDraft;
  step: number;
  maxStep: number;
}

function readDraft(): StoredDraft | null {
  try {
    const v = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    return v && v.a ? v : null;
  } catch {
    return null;
  }
}
function writeDraft(d: StoredDraft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* ignore — storage unavailable or full */
  }
}
function clearDraftStorage() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

/** Fit questions actually in play — trimmed of blanks, options cleaned. */
export function activeFitQuestions(reg: Registration) {
  return (reg.fitQuestions || [])
    .filter((q) => String(q.prompt || '').trim())
    .map((q) => ({ ...q, options: (q.options || []).map((o) => String(o).trim()).filter(Boolean) }));
}

const rec = (a: ApplicationDraft) => a as unknown as Record<string, string>;

/** Per-step validation, mirrors the reference prototype exactly. Used both
 * to gate step navigation/submit and to decide which field errors to show. */
export function computeErrors(step: number, a: ApplicationDraft, reg: Registration): Record<string, string> {
  const e: Record<string, string> = {};
  const blank = (v: string | undefined) => !String(v || '').trim();
  if (step === 0) {
    if (blank(a.discord)) e.discord = 'Add your Discord name so the DM can reach you.';
    if (!a.experience) e.experience = 'Pick one.';
    if (!a.aspects.length) e.aspects = 'Pick at least one.';
    if (!a.playstyle.length) e.playstyle = 'Pick at least one.';
    if (blank(a.pitch)) e.pitch = 'Tell the DM a little about yourself.';
  } else if (step === 1) {
    activeFitQuestions(reg).forEach((q) => {
      if (q.required && blank(a.fit[q.id])) e[`fit.${q.id}`] = q.type === 'choice' ? 'Pick one.' : 'This one is required.';
    });
  } else if (step === 2) {
    if (!a.bond) e.bond = 'Pick one.';
    if (!a.conflict) e.conflict = 'Pick one.';
    if (a.bond === 'other' && blank(a.bondNote)) e.bondNote = 'You picked Other. Tell us a bit more.';
    if (a.conflict === 'other' && blank(a.conflictNote)) e.conflictNote = 'You picked Other. Tell us a bit more.';
    VIBE_QS.forEach((v) => {
      const val = rec(a)[v.id];
      if (!val) e[v.id] = 'Pick one.';
      else if (val === 'other' && blank(rec(a)[v.id + 'Note'])) e[v.id + 'Note'] = 'You picked Other. Tell us a bit more.';
    });
    if (!a.conduct.includes('agreed')) e.conduct = 'You need to agree to the conduct policy to apply.';
  } else if (step === 3) {
    if (blank(a.name)) e.name = 'Your character needs a name.';
    const noHbS = reg.allowHomebrew === false;
    if (!a.species || (a.species === 'other' && (noHbS || blank(a.speciesOther)))) {
      e.species = a.species === 'other' && !noHbS ? 'Name the species.' : 'Pick a species.';
    }
    const l = classesOf(a);
    const noHb = reg.allowHomebrew === false;
    const bad = !l.length || l.some((x) => !x.klass || (x.klass === 'other' && (noHb || blank(x.klassOther))));
    if (bad) e.klass = a.multiclass ? 'Pick and name a class for every slot.' : l[0] && l[0].klass === 'other' ? 'Name the class.' : 'Pick a class.';
    if (blank(a.backstory)) e.backstory = 'Write at least a few lines of backstory.';
  }
  return e;
}

export function useRegistration() {
  const { content, loading: contentLoading, error: contentError, retry: retryContent } = useContent();
  const [view, setView] = useState<RegView>('intro');
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [a, setAState] = useState<ApplicationDraft>(blankApplication());
  const [tried, setTried] = useState<Record<number, boolean>>({});
  const [hasDraft, setHasDraft] = useState(false);
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  const [sentName, setSentName] = useState('');
  const [sentDiscord, setSentDiscord] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const d = readDraft();
    if (d) {
      setAState(Object.assign(blankApplication(), d.a));
      setStep(d.step || 0);
      setMaxStep(d.maxStep || 0);
      setHasDraft(true);
    }
  }, []);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!hasDraft) return;
    writeDraft({ a, step, maxStep });
  }, [a, step, maxStep, hasDraft]);

  const setA = useCallback((fn: (draft: ApplicationDraft) => void) => {
    setAState((prev) => {
      const next = clone(prev);
      fn(next);
      return next;
    });
    setHasDraft(true);
  }, []);

  const goStep = useCallback((s: number) => {
    setMaxStep((prev) => Math.max(prev, s));
    setStep(s);
    setView('form');
    setHasDraft(true);
    window.scrollTo(0, 0);
  }, []);

  const begin = useCallback(() => goStep(hasDraft ? step : 0), [goStep, hasDraft, step]);

  const startOver = useCallback(() => {
    if (!window.confirm('Clear your saved answers and start again?')) return;
    clearDraftStorage();
    setAState(blankApplication());
    setStep(0);
    setMaxStep(0);
    setTried({});
    setHasDraft(false);
  }, []);

  const errors = useMemo(() => computeErrors(step, a, content.registration), [step, a, content.registration]);
  const errShown = tried[step] ? errors : {};

  const next = useCallback(() => {
    if (Object.keys(errors).length) {
      setTried((prev) => ({ ...prev, [step]: true }));
      window.scrollTo(0, 0);
      return;
    }
    if (step < 3) goStep(step + 1);
    else {
      setView('review');
      window.scrollTo(0, 0);
    }
  }, [errors, step, goStep]);

  const back = useCallback(() => {
    if (step === 0) {
      setView('intro');
      window.scrollTo(0, 0);
    } else goStep(step - 1);
  }, [step, goStep]);

  const backToForm = useCallback(() => goStep(3), [goStep]);

  const submit = useCallback(async () => {
    for (let i = 0; i < 4; i++) {
      if (Object.keys(computeErrors(i, a, content.registration)).length) {
        setTried((prev) => ({ ...prev, [i]: true }));
        goStep(i);
        return;
      }
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const fitSnapshot = activeFitQuestions(content.registration).map((q) => ({ id: q.id, prompt: q.prompt }));
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...a, fitSnapshot }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(body?.error || 'Something went wrong submitting your application. Try again.');
        return;
      }
      clearDraftStorage();
      setSentName(a.name.trim());
      setSentDiscord(a.discord.trim());
      setView('done');
      setAState(blankApplication());
      setStep(0);
      setMaxStep(0);
      setTried({});
      setHasDraft(false);
      window.scrollTo(0, 0);
    } catch {
      setSubmitError('Could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }, [a, content.registration, goStep]);

  return {
    content,
    contentLoading,
    contentError,
    retryContent,
    reg: content.registration,
    view,
    step,
    maxStep,
    a,
    setA,
    tried,
    errors,
    errShown,
    hasDraft,
    width,
    begin,
    startOver,
    goStep,
    next,
    back,
    backToForm,
    submit,
    submitting,
    submitError,
    sentName,
    sentDiscord,
  };
}

export type UseRegistration = ReturnType<typeof useRegistration>;
