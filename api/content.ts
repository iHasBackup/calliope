import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedis } from './_redis.js';
import { requireSession } from './_session.js';
import { DEFAULT_CONTENT, sanitizeContent, type Content } from '../src/campaign/content.js';

const CONTENT_KEY = 'content:crooked-moon';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const redis = getRedis();

    if (req.method === 'GET') {
      // No caching: a cached response here can outlive a save, so the
      // admin's next load (and thus its updatedAt) goes stale and every
      // subsequent save spuriously 409s against the real current value.
      res.setHeader('Cache-Control', 'no-store');
      const stored = await redis.get<Content>(CONTENT_KEY);
      // Sanitize on read too, not just on write: a document saved before a
      // schema change (new fields added to Content) is missing them, and
      // the client assumes every field is always present.
      res.status(200).json(stored ? { ...sanitizeContent(stored), updatedAt: stored.updatedAt } : { ...DEFAULT_CONTENT, updatedAt: 0 });
      return;
    }

    if (req.method === 'PUT') {
      res.setHeader('Cache-Control', 'no-store');
      if (!requireSession(req, res)) return;

      const body = req.body ?? {};
      const stored = await redis.get<Content>(CONTENT_KEY);
      if (stored && body.updatedAt !== stored.updatedAt) {
        res.status(409).json({ error: 'This content changed elsewhere — reload and reapply your edits.', current: stored });
        return;
      }

      const saved: Content = { ...sanitizeContent(body), updatedAt: Date.now() };
      await redis.set(CONTENT_KEY, saved);
      res.status(200).json(saved);
      return;
    }

    res.setHeader('Allow', 'GET, PUT');
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('api/content error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
