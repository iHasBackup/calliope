// Shared content schema for the campaign site + admin CMS. Used by the
// client (public site, admin UI) and the api/content.ts serverless
// function alike — kept dependency-free (no React) so it works in both.

export interface PartyMember {
  id: string;
  name: string;
  species: string;
  klass: string;
  sub: string;
  portraitUrl: string;
  appId?: string; // set when this member was added by accepting an application — links back to it
}

export interface Recap {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  nights: string; // "9" or "9-10"
  body: string;
  tags: string; // comma separated
}

export interface Schedule {
  weekday: number; // 0-6, 0 = Sunday
  hour: number; // 0-23
  timezone: string; // IANA zone, e.g. "Asia/Jakarta" — drives the countdown math
  label: string; // display label, e.g. "GMT+7"
}

export interface FitQuestion {
  id: string;
  type: 'choice' | 'text';
  required: boolean;
  prompt: string;
  options: string[];
}

export interface Registration {
  open: boolean;
  seats: number; // 1-8
  deadline: string; // YYYY-MM-DD, closes end of day in the campaign timezone — '' means no deadline
  modules: string[]; // active sourcebook ids from classModules.ts; [] means "nothing set" (defaults apply)
  allowHomebrew: boolean;
  intro: string;
  fitTitle: string;
  fitIntro: string;
  fitQuestions: FitQuestion[];
}

export interface Content {
  arcTitle: string;
  arcChapter: string;
  arcBlurb: string;
  keyArtUrl: string;
  nights: number;
  progress: number; // 0-100
  partyLevel: number; // 1-20
  summary: string; // paragraphs separated by a blank line
  threads: string[];
  schedule: Schedule;
  showOpenSeat: boolean;
  registration: Registration;
  party: PartyMember[];
  recaps: Recap[];
  updatedAt: number; // ms epoch — used for optimistic concurrency on save
}

export const DEFAULT_CONTENT: Content = {
  arcTitle: 'The Harvest Below the Hill',
  arcChapter: 'Chapter II',
  arcBlurb:
    'The party has followed the missing reapers to the barrow under Gallows Hill. The village insists the harvest must be finished before the moon turns full, and nobody will say what happens if it isn’t.',
  keyArtUrl: '',
  nights: 8,
  progress: 24,
  partyLevel: 4,
  summary:
    'Four strangers arrived in the valley of Hollowmere on the last cart before the roads flooded. They found a village that keeps its lanterns lit all night, a church with no priest, and a hill the children are forbidden to climb.\n\nThey have since broken a witch-bottle, burned a scarecrow that would not stay still, and struck a bargain with the Crone at the edge of the wood that none of them fully understand. The moon has risen crooked every night since.',
  threads: [
    'Who took the reapers into the barrow, and why did they go willingly?',
    'The Crone’s price is still unpaid. She said she would name it at the full moon.',
    'A name in the church ledger of the dead belongs to someone the party spoke to yesterday.',
  ],
  schedule: { weekday: 3, hour: 19, timezone: 'Asia/Jakarta', label: 'GMT+7' },
  showOpenSeat: true,
  registration: {
    open: true,
    seats: 1,
    deadline: '2026-10-31',
    modules: ['phb', 'tcm'],
    allowHomebrew: true,
    intro:
      'One seat is open at the table. Tell us about yourself as a player and the character you want to bring to Hollowmere. The DM reads every application and will reply on Discord.',
    fitTitle: 'Campaign fit',
    fitIntro:
      'The Crooked Moon is a long campaign with dark subject matter. Answer honestly. A no here is not a mark against you, just a sign this table is not the right one.',
    fitQuestions: [
      {
        id: 'f1',
        type: 'choice',
        required: true,
        prompt: 'This is a long campaign. We expect to play weekly for about a year. Can you commit to that?',
        options: ['Yes, I can commit for a year or more', 'Mostly, with the occasional missed session', 'I am not sure yet'],
      },
      {
        id: 'f2',
        type: 'choice',
        required: true,
        prompt: 'The setting is folk horror: occultism, gore, and physical and mental violence. Are you comfortable with these themes?',
        options: ['Yes, all of it', 'Yes, within the lines and veils I listed', 'No, this is not for me'],
      },
      {
        id: 'f3',
        type: 'choice',
        required: true,
        prompt: 'Are you okay with your character being mutilated, losing a limb, or even dying?',
        options: ['Yes, any of it', 'Injury and mutilation, but not death', 'I would rather not'],
      },
      { id: 'f4', type: 'text', required: false, prompt: 'Anything else about these themes the DM should know?', options: [] },
    ],
  },
  party: [
    { id: 'p1', name: 'Oberon', species: 'Species TBD', klass: 'Sorcerer', sub: 'Wild Magic', portraitUrl: '' },
    { id: 'p2', name: 'Hayden', species: 'Species TBD', klass: 'Death Knight', sub: 'Subclass TBD', portraitUrl: '' },
    { id: 'p3', name: 'Carmen', species: 'Species TBD', klass: 'Druid', sub: 'Subclass TBD', portraitUrl: '' },
    { id: 'p4', name: 'Ambary', species: 'Species TBD', klass: 'Rogue', sub: 'Subclass TBD', portraitUrl: '' },
  ],
  recaps: [
    { id: 'r1', title: 'The Last Cart to Hollowmere', date: '2026-08-05', nights: '1', body: 'The party met on the flooded road and reached the village at dusk. The innkeeper warned them to keep a lantern burning. Carmen found salt lines under every door.', tags: 'Hollowmere, The Lantern Inn' },
    { id: 'r2', title: 'Straw and Bone', date: '2026-08-12', nights: '2', body: 'A scarecrow in the east field moved between one look and the next. The party burned it, and found a child’s tooth sewn into its chest.', tags: 'East field, Scarecrow' },
    { id: 'r3', title: 'The Witch-Bottle', date: '2026-08-19', nights: '3', body: 'Ambary broke a witch-bottle hidden in the church wall. That night every dog in the village howled until dawn.', tags: 'Church, Curse' },
    { id: 'r4', title: 'A Bargain in the Wood', date: '2026-08-26', nights: '4–5', body: 'Lost in the wood, the party accepted the Crone’s help home. Her price will be named at the full moon.', tags: 'The Crone, Bargain' },
    { id: 'r5', title: 'The Ledger of the Dead', date: '2026-09-02', nights: '6', body: 'Hayden read the parish ledger and found names of villagers who are still walking the streets.', tags: 'Church, Ledger' },
    { id: 'r6', title: 'Gallows Hill', date: '2026-09-09', nights: '7', body: 'Following the missing reapers, the party climbed the forbidden hill and found the barrow door already open.', tags: 'Gallows Hill, Barrow' },
    { id: 'r7', title: 'Below the Hill', date: '2026-09-16', nights: '8', body: 'Inside the barrow the reapers were still harvesting, in the dark, a field that should not exist underground. Session ended mid-combat.', tags: 'Barrow, Cliffhanger' },
  ],
  updatedAt: 0,
};

// ---- limits & validation (shared by the server and the admin UI) ----

export const LIMITS = {
  shortText: 200, // titles, names, labels
  mediumText: 500, // per-thread text, recap nights label
  longText: 3000, // blurbs
  hugeText: 20000, // summary, recap body
  url: 2000,
  tagsText: 300,
  maxParty: 20,
  maxRecaps: 500,
  maxThreads: 50,
  maxFitQuestions: 20,
  maxFitOptions: 12,
  maxModules: 20,
};

function clampInt(n: unknown, min: number, max: number, fallback: number): number {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.round(Math.max(min, Math.min(max, v)));
}

function str(v: unknown, maxLen: number, fallback = ''): string {
  const s = typeof v === 'string' ? v : fallback;
  return s.trim().slice(0, maxLen);
}

/** Sanitizes and validates an arbitrary parsed JSON body into a well-formed
 * Content document (minus updatedAt, which the caller controls). Never
 * throws — unknown/malformed input just falls back to defaults field by
 * field, since this is the boundary where we can't trust the caller. */
export function sanitizeContent(input: unknown): Omit<Content, 'updatedAt'> {
  const c = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const sched = (c.schedule && typeof c.schedule === 'object' ? c.schedule : {}) as Record<string, unknown>;

  const party = Array.isArray(c.party) ? c.party : [];
  const recaps = Array.isArray(c.recaps) ? c.recaps : [];
  const threads = Array.isArray(c.threads) ? c.threads : [];
  const reg = (c.registration && typeof c.registration === 'object' ? c.registration : {}) as Record<string, unknown>;
  const fitQuestions = Array.isArray(reg.fitQuestions) ? reg.fitQuestions : [];
  const regModules = Array.isArray(reg.modules) ? reg.modules : [];
  const deadline = str(reg.deadline, 10);

  let timezone = str(sched.timezone, 100, DEFAULT_CONTENT.schedule.timezone);
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
  } catch {
    timezone = DEFAULT_CONTENT.schedule.timezone;
  }

  return {
    arcTitle: str(c.arcTitle, LIMITS.shortText, DEFAULT_CONTENT.arcTitle),
    arcChapter: str(c.arcChapter, LIMITS.shortText, DEFAULT_CONTENT.arcChapter),
    arcBlurb: str(c.arcBlurb, LIMITS.longText),
    keyArtUrl: str(c.keyArtUrl, LIMITS.url),
    nights: clampInt(c.nights, 0, 9999, DEFAULT_CONTENT.nights),
    progress: clampInt(c.progress, 0, 100, DEFAULT_CONTENT.progress),
    partyLevel: clampInt(c.partyLevel, 1, 20, DEFAULT_CONTENT.partyLevel),
    summary: str(c.summary, LIMITS.hugeText),
    threads: threads.slice(0, LIMITS.maxThreads).map((t) => str(t, LIMITS.mediumText)),
    schedule: {
      weekday: clampInt(sched.weekday, 0, 6, DEFAULT_CONTENT.schedule.weekday),
      hour: clampInt(sched.hour, 0, 23, DEFAULT_CONTENT.schedule.hour),
      timezone,
      label: str(sched.label, 40, DEFAULT_CONTENT.schedule.label),
    },
    showOpenSeat: c.showOpenSeat !== false,
    registration: {
      open: reg.open !== false,
      seats: clampInt(reg.seats, 1, 8, DEFAULT_CONTENT.registration.seats),
      deadline: /^\d{4}-\d{2}-\d{2}$/.test(deadline) ? deadline : '',
      modules: regModules.slice(0, LIMITS.maxModules).map((m) => str(m, 20)).filter(Boolean),
      allowHomebrew: reg.allowHomebrew !== false,
      intro: str(reg.intro, LIMITS.longText),
      fitTitle: str(reg.fitTitle, LIMITS.shortText),
      fitIntro: str(reg.fitIntro, LIMITS.longText),
      fitQuestions: fitQuestions.slice(0, LIMITS.maxFitQuestions).map((raw, i) => {
        const q = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
        const options = Array.isArray(q.options) ? q.options : [];
        return {
          id: str(q.id, 40) || `f${i}`,
          type: q.type === 'text' ? 'text' : 'choice',
          required: q.required !== false,
          prompt: str(q.prompt, LIMITS.longText),
          options: options.slice(0, LIMITS.maxFitOptions).map((o) => str(o, LIMITS.shortText)).filter(Boolean),
        } as FitQuestion;
      }),
    },
    party: party.slice(0, LIMITS.maxParty).map((raw, i) => {
      const m = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
      const appId = str(m.appId, 40);
      return {
        id: str(m.id, 40) || `p${i}`,
        name: str(m.name, LIMITS.shortText),
        species: str(m.species, LIMITS.shortText),
        klass: str(m.klass, LIMITS.shortText),
        sub: str(m.sub, LIMITS.shortText),
        portraitUrl: str(m.portraitUrl, LIMITS.url),
        ...(appId ? { appId } : {}),
      };
    }),
    recaps: recaps.slice(0, LIMITS.maxRecaps).map((raw, i) => {
      const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
      const date = str(r.date, 10);
      return {
        id: str(r.id, 40) || `r${i}`,
        title: str(r.title, LIMITS.shortText),
        date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '',
        nights: str(r.nights, LIMITS.mediumText),
        body: str(r.body, LIMITS.hugeText),
        tags: str(r.tags, LIMITS.tagsText),
      };
    }),
  };
}
