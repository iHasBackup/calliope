// Application document schema (player registration submissions). Kept
// dependency-free (no React) so it works from both the client and
// api/applications.ts alike, mirroring src/campaign/content.ts.

export interface ClassEntry {
  klass: string;
  klassOther: string;
  sub: string;
  subOther: string;
  lv: number | null;
}

export type ApplicationStatus = 'new' | 'shortlisted' | 'accepted' | 'declined';

export interface Application {
  id: string;
  submittedAt: string; // ISO timestamp
  status: ApplicationStatus;

  // 01 General information
  discord: string;
  experience: string;
  aspects: string[];
  playstyle: string[];
  lines: string;
  veils: string;
  pitch: string;

  // 02 Campaign fit (per-campaign questions, from Content.registration.fitQuestions)
  fit: Record<string, string>;
  fitSnapshot: { id: string; prompt: string }[];

  // 03 Vibe check
  bond: string;
  bondNote: string;
  conflict: string;
  conflictNote: string;
  spotlight: string;
  spotlightNote: string;
  bigMoment: string;
  bigMomentNote: string;
  pcImpact: string;
  pcImpactNote: string;
  raw: string;
  rawNote: string;
  secrets: string;
  secretsNote: string;
  conduct: string[];

  // 04 Character
  name: string;
  species: string;
  speciesOther: string;
  multiclass: boolean;
  classes: ClassEntry[];
  // Mirror of classes[0], kept for legacy/simple readers.
  klass: string;
  klassOther: string;
  sub: string;
  subOther: string;
  backstory: string;
  faceUrl: string;
}

export type ApplicationDraft = Omit<Application, 'id' | 'submittedAt' | 'status'>;

export function blankClassEntry(): ClassEntry {
  return { klass: '', klassOther: '', sub: '', subOther: '', lv: null };
}

export function blankApplication(): ApplicationDraft {
  return {
    discord: '',
    experience: '',
    aspects: [],
    playstyle: [],
    lines: '',
    veils: '',
    pitch: '',
    fit: {},
    fitSnapshot: [],
    bond: '',
    bondNote: '',
    conflict: '',
    conflictNote: '',
    spotlight: '',
    spotlightNote: '',
    bigMoment: '',
    bigMomentNote: '',
    pcImpact: '',
    pcImpactNote: '',
    raw: '',
    rawNote: '',
    secrets: '',
    secretsNote: '',
    conduct: [],
    name: '',
    species: '',
    speciesOther: '',
    multiclass: false,
    classes: [],
    klass: '',
    klassOther: '',
    sub: '',
    subOther: '',
    backstory: '',
    faceUrl: '',
  };
}

export const APP_LIMITS = {
  shortText: 200,
  mediumText: 1000,
  longText: 8000,
  url: 2000,
  maxFitAnswers: 40,
  maxClasses: 3,
  maxConduct: 4,
  maxTags: 10,
};

function clampInt(n: unknown, min: number, max: number): number | null {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return null;
  return Math.round(Math.max(min, Math.min(max, v)));
}

function str(v: unknown, maxLen: number): string {
  const s = typeof v === 'string' ? v : '';
  return s.trim().slice(0, maxLen);
}

function strArr(v: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, maxItems).map((x) => str(x, maxLen)).filter(Boolean);
}

function sanitizeClassEntry(raw: unknown): ClassEntry {
  const e = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    klass: str(e.klass, APP_LIMITS.shortText),
    klassOther: str(e.klassOther, APP_LIMITS.shortText),
    sub: str(e.sub, APP_LIMITS.shortText),
    subOther: str(e.subOther, APP_LIMITS.shortText),
    lv: clampInt(e.lv, 1, 20),
  };
}

/** Sanitizes an arbitrary parsed JSON body into a well-formed Application
 * (minus id/submittedAt/status, which the server controls). Never throws. */
export function sanitizeApplication(input: unknown): Omit<Application, 'id' | 'submittedAt' | 'status'> {
  const a = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const fitRaw = (a.fit && typeof a.fit === 'object' ? a.fit : {}) as Record<string, unknown>;
  const fit: Record<string, string> = {};
  Object.keys(fitRaw)
    .slice(0, APP_LIMITS.maxFitAnswers)
    .forEach((k) => {
      fit[str(k, 80)] = str(fitRaw[k], APP_LIMITS.longText);
    });
  const fitSnapshotRaw = Array.isArray(a.fitSnapshot) ? a.fitSnapshot : [];
  const fitSnapshot = fitSnapshotRaw.slice(0, APP_LIMITS.maxFitAnswers).map((raw) => {
    const q = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    return { id: str(q.id, 80), prompt: str(q.prompt, APP_LIMITS.shortText) };
  });
  const classesRaw = Array.isArray(a.classes) ? a.classes : [];
  const classes = classesRaw.slice(0, APP_LIMITS.maxClasses).map(sanitizeClassEntry);
  const first = classes[0] || sanitizeClassEntry(null);

  return {
    discord: str(a.discord, APP_LIMITS.shortText),
    experience: str(a.experience, 40),
    aspects: strArr(a.aspects, 10, 40),
    playstyle: strArr(a.playstyle, 20, 40),
    lines: str(a.lines, APP_LIMITS.longText),
    veils: str(a.veils, APP_LIMITS.longText),
    pitch: str(a.pitch, APP_LIMITS.longText),
    fit,
    fitSnapshot,
    bond: str(a.bond, 40),
    bondNote: str(a.bondNote, APP_LIMITS.mediumText),
    conflict: str(a.conflict, 40),
    conflictNote: str(a.conflictNote, APP_LIMITS.mediumText),
    spotlight: str(a.spotlight, 40),
    spotlightNote: str(a.spotlightNote, APP_LIMITS.mediumText),
    bigMoment: str(a.bigMoment, 40),
    bigMomentNote: str(a.bigMomentNote, APP_LIMITS.mediumText),
    pcImpact: str(a.pcImpact, 40),
    pcImpactNote: str(a.pcImpactNote, APP_LIMITS.mediumText),
    raw: str(a.raw, 40),
    rawNote: str(a.rawNote, APP_LIMITS.mediumText),
    secrets: str(a.secrets, 40),
    secretsNote: str(a.secretsNote, APP_LIMITS.mediumText),
    conduct: strArr(a.conduct, APP_LIMITS.maxConduct, 40),
    name: str(a.name, APP_LIMITS.shortText),
    species: str(a.species, APP_LIMITS.shortText),
    speciesOther: str(a.speciesOther, APP_LIMITS.shortText),
    multiclass: a.multiclass === true,
    classes,
    klass: first.klass,
    klassOther: first.klassOther,
    sub: first.sub,
    subOther: first.subOther,
    backstory: str(a.backstory, APP_LIMITS.longText),
    faceUrl: /^https?:\/\//i.test(str(a.faceUrl, APP_LIMITS.url)) ? str(a.faceUrl, APP_LIMITS.url) : '',
  };
}
