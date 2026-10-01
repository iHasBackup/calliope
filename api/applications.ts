import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedis } from './_redis.js';
import { requireSession } from './_session.js';
import { DEFAULT_CONTENT, type Content, type PartyMember } from '../src/campaign/content.js';
import { sanitizeApplication, type Application, type ApplicationStatus } from '../src/campaign/application.js';
import { EXPERIENCE, ASPECTS, PLAYSTYLES, BOND, CONFLICT, VIBE_QS, speciesOf, classOf, subOf } from '../src/campaign/registrationData.js';
import { build as buildClasses, buildSpecies } from '../src/campaign/classModules.js';

const CONTENT_KEY = 'content:crooked-moon';
const APPS_KEY = 'applications:crooked-moon';
const STATUSES: ApplicationStatus[] = ['new', 'shortlisted', 'accepted', 'declined'];

const RATE_LIMIT_WINDOW_S = 60 * 60;
const RATE_LIMIT_MAX = 10;

function rateLimitKey(ip: string) {
  return `ratelimit:applications:${ip}`;
}

function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const first = Array.isArray(fwd) ? fwd[0] : fwd;
  return first?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
}

/** "Past" means the current date in the campaign timezone is after the
 * deadline date — the deadline's own day still counts as open. Comparing
 * YYYY-MM-DD strings lexicographically avoids separate offset math. */
function isPastDeadline(deadline: string, timeZone: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return false;
  const todayInTz = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return todayInTz > deadline;
}

function valueIn(list: { v: string }[], v: string): boolean {
  return list.some((x) => x.v === v);
}

/** Validates a sanitized application against the campaign's current
 * registration config. Returns an error string, or '' if valid. This is a
 * defense-in-depth check — the public form already enforces all of this
 * client-side, so a generic message is enough. */
function validateApplication(a: Omit<Application, 'id' | 'submittedAt' | 'status'>, content: Content): string {
  const reg = content.registration;
  const blank = (v: string) => !v.trim();

  if (blank(a.discord)) return 'Add a Discord name.';
  if (!valueIn(EXPERIENCE, a.experience)) return 'Pick a D&D experience level.';
  if (!a.aspects.length || !a.aspects.every((v) => valueIn(ASPECTS, v))) return 'Pick at least one enjoyed aspect.';
  if (!a.playstyle.length || !a.playstyle.every((v) => valueIn(PLAYSTYLES, v))) return 'Pick at least one playstyle.';
  if (blank(a.pitch)) return 'Tell the DM a little about yourself.';

  const activeFitQs = (reg.fitQuestions || []).filter((q) => q.prompt.trim());
  for (const q of activeFitQs) {
    const answer = (a.fit[q.id] || '').trim();
    if (q.required && !answer) return `Answer required: ${q.prompt}`;
    if (q.type === 'choice' && answer && !q.options.includes(answer)) return `Invalid answer for: ${q.prompt}`;
  }

  if (!valueIn(BOND, a.bond)) return 'Pick a bonding style.';
  if (a.bond === 'other' && blank(a.bondNote)) return 'Describe your bonding style.';
  if (!valueIn(CONFLICT, a.conflict)) return 'Pick a conflict-handling style.';
  if (a.conflict === 'other' && blank(a.conflictNote)) return 'Describe how you handle conflict.';
  for (const v of VIBE_QS) {
    const val = (a as unknown as Record<string, string>)[v.id];
    if (!valueIn(v.opts, val)) return `Answer required: ${v.label}`;
    if (val === 'other' && blank((a as unknown as Record<string, string>)[v.id + 'Note'])) return `Tell us more: ${v.label}`;
  }
  if (!a.conduct.includes('agreed')) return 'You need to agree to the conduct policy.';

  if (blank(a.name)) return 'Your character needs a name.';
  const allowHb = reg.allowHomebrew !== false;
  const speciesOk = buildSpecies(reg.modules).some((s) => s.v === a.species) || (allowHb && a.species === 'other');
  if (!speciesOk) return 'Pick a valid species.';
  if (a.species === 'other' && blank(a.speciesOther)) return 'Name the species.';

  const classList = buildClasses(reg.modules).filter((k) => k.v !== 'other' || allowHb);
  if (!a.classes.length) return 'Pick a class.';
  if (a.classes.length > 3) return 'Too many classes.';
  for (const e of a.classes) {
    if (!classList.some((k) => k.v === e.klass)) return 'Pick a valid class.';
    if (e.klass === 'other' && blank(e.klassOther)) return 'Name the class.';
  }
  if (blank(a.backstory)) return 'Write at least a few lines of backstory.';

  return '';
}

async function loadApps(redis: ReturnType<typeof getRedis>): Promise<Application[]> {
  const map = await redis.hgetall<Record<string, Application>>(APPS_KEY);
  return map ? Object.values(map) : [];
}

/** Adds/removes the party member tied to this application, mirroring the
 * admin's accept/un-accept behaviour. Always wins (no optimistic-concurrency
 * check) since this is a narrow, additive side effect of a status change. */
async function syncParty(redis: ReturnType<typeof getRedis>, app: Application, onParty: boolean): Promise<Content | null> {
  const stored = (await redis.get<Content>(CONTENT_KEY)) ?? { ...DEFAULT_CONTENT, updatedAt: 0 };
  const idx = stored.party.findIndex((m) => m.appId === app.id);
  if (onParty && idx < 0) {
    const member: PartyMember = {
      id: Math.random().toString(36).slice(2, 9),
      appId: app.id,
      name: app.name.trim() || app.discord || 'New member',
      species: speciesOf(app),
      klass: classOf(app),
      sub: subOf(app),
      portraitUrl: app.faceUrl || '',
    };
    stored.party = [...stored.party, member];
  } else if (!onParty && idx >= 0) {
    stored.party = stored.party.filter((_, i) => i !== idx);
  } else {
    return null;
  }
  const saved: Content = { ...stored, updatedAt: Date.now() };
  await redis.set(CONTENT_KEY, saved);
  return saved;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const redis = getRedis();
    const id = typeof req.query.id === 'string' ? req.query.id : '';

    if (req.method === 'GET') {
      if (!requireSession(req, res)) return;
      const apps = await loadApps(redis);
      res.status(200).json(apps);
      return;
    }

    if (req.method === 'POST') {
      const ip = clientIp(req);
      const rlKey = rateLimitKey(ip);
      const count = await redis.incr(rlKey);
      if (count === 1) await redis.expire(rlKey, RATE_LIMIT_WINDOW_S);
      if (count > RATE_LIMIT_MAX) {
        res.status(429).json({ error: 'Too many submissions. Try again later.' });
        return;
      }

      const content = (await redis.get<Content>(CONTENT_KEY)) ?? { ...DEFAULT_CONTENT, updatedAt: 0 };
      const reg = content.registration;
      if (reg.open === false || isPastDeadline(reg.deadline, content.schedule.timezone)) {
        res.status(403).json({ error: 'Applications are closed.' });
        return;
      }

      const sanitized = sanitizeApplication(req.body ?? {});
      const activeFitQs = (reg.fitQuestions || []).filter((q) => q.prompt.trim());
      sanitized.fitSnapshot = activeFitQs.map((q) => ({ id: q.id, prompt: q.prompt }));
      const fit: Record<string, string> = {};
      for (const q of activeFitQs) fit[q.id] = sanitized.fit[q.id] || '';
      sanitized.fit = fit;

      const error = validateApplication(sanitized, content);
      if (error) {
        res.status(400).json({ error });
        return;
      }

      const app: Application = { ...sanitized, id: Math.random().toString(36).slice(2, 9), submittedAt: new Date().toISOString(), status: 'new' };
      await redis.hset(APPS_KEY, { [app.id]: app });
      res.status(200).json(app);
      return;
    }

    if (req.method === 'PATCH') {
      if (!requireSession(req, res)) return;
      if (!id) {
        res.status(400).json({ error: 'Missing id.' });
        return;
      }
      const status = (req.body ?? {}).status;
      if (!STATUSES.includes(status)) {
        res.status(400).json({ error: 'Invalid status.' });
        return;
      }
      const existing = await redis.hget<Application>(APPS_KEY, id);
      if (!existing) {
        res.status(404).json({ error: 'Application not found.' });
        return;
      }
      const updated: Application = { ...existing, status };
      await redis.hset(APPS_KEY, { [id]: updated });
      const content = status !== existing.status ? await syncParty(redis, updated, status === 'accepted') : null;
      res.status(200).json(content ? { application: updated, content } : { application: updated });
      return;
    }

    if (req.method === 'DELETE') {
      if (!requireSession(req, res)) return;
      if (!id) {
        res.status(400).json({ error: 'Missing id.' });
        return;
      }
      await redis.hdel(APPS_KEY, id);
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('api/applications error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
