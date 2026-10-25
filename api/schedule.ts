import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedis } from './_redis.js';
import { requireSession } from './_session.js';
import { DEFAULT_CONTENT, sanitizeChanges, sanitizeContent, type Content } from '../src/campaign/content.js';
import { addScheduleChange, changeError, undoScheduleChange, type ChangeInput } from '../src/campaign/schedule.js';

const CONTENT_KEY = 'content:crooked-moon';

// Schedule changes save on their own, outside the admin's Save button:
// POST { action: 'add', change } or { action: 'undo', changeId }.
// The change and its history row are written together, server-side.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!requireSession(req, res)) return;

  try {
    const body = req.body ?? {};
    const redis = getRedis();
    const stored = await redis.get<Content>(CONTENT_KEY);
    const current = sanitizeContent(stored ?? DEFAULT_CONTENT);

    let schedule = current.schedule;
    if (body.action === 'add') {
      const raw = body.change ?? {};
      if (raw.type !== 'cancel' && raw.type !== 'move' && raw.type !== 'extra') {
        res.status(400).json({ error: 'Unknown change type.' });
        return;
      }
      const error = changeError({ type: raw.type, date: String(raw.date ?? ''), toDate: String(raw.toDate ?? '') });
      // Same sanitizer as the content document: trims the note, clamps the hour.
      const [clean] = sanitizeChanges([{ ...raw, id: 'new' }]);
      if (error || !clean) {
        res.status(400).json({ error: error || 'That change is not valid.' });
        return;
      }
      const input: ChangeInput = { type: clean.type, date: clean.date, toDate: clean.toDate, toHour: clean.toHour, note: clean.note };
      schedule = addScheduleChange(schedule, input);
    } else if (body.action === 'undo' && typeof body.changeId === 'string') {
      if (!schedule.changes.some((x) => x.id === body.changeId)) {
        res.status(404).json({ error: 'That change was already removed.' });
        return;
      }
      schedule = undoScheduleChange(schedule, body.changeId);
    } else {
      res.status(400).json({ error: 'Unknown action.' });
      return;
    }

    const saved: Content = { ...sanitizeContent({ ...current, schedule }), updatedAt: Date.now() };
    await redis.set(CONTENT_KEY, saved);
    res.status(200).json(saved);
  } catch (err) {
    console.error('api/schedule error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
