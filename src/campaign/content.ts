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
    party: party.slice(0, LIMITS.maxParty).map((raw, i) => {
      const m = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
      return {
        id: str(m.id, 40) || `p${i}`,
        name: str(m.name, LIMITS.shortText),
        species: str(m.species, LIMITS.shortText),
        klass: str(m.klass, LIMITS.shortText),
        sub: str(m.sub, LIMITS.shortText),
        portraitUrl: str(m.portraitUrl, LIMITS.url),
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
