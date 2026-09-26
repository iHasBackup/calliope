import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hasValidSession } from '../_session.js';

// Lets the admin UI check on load whether the httpOnly session cookie is
// still valid, so a page refresh within the session TTL doesn't force a
// re-login (the cookie itself isn't readable from client JS).
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  res.status(200).json({ ok: hasValidSession(req) });
}
