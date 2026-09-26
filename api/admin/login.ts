import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { getRedis } from '../_redis.js';
import { createSessionCookie } from '../_session.js';

const RATE_LIMIT_WINDOW_S = 300; // 5 min
const RATE_LIMIT_MAX = 8;

function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const first = Array.isArray(fwd) ? fwd[0] : fwd;
  return first?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const expected = process.env.ADMIN_PASSCODE;
    if (!expected) {
      res.status(500).json({ error: 'Admin login is not configured.' });
      return;
    }

    const redis = getRedis();
    const ip = clientIp(req);
    const rlKey = `ratelimit:admin-login:${ip}`;
    const count = await redis.incr(rlKey);
    if (count === 1) await redis.expire(rlKey, RATE_LIMIT_WINDOW_S);
    if (count > RATE_LIMIT_MAX) {
      res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' });
      return;
    }

    const body = req.body ?? {};
    const passcode = typeof body.passcode === 'string' ? body.passcode : '';
    if (!passcode || !safeEqual(passcode, expected)) {
      res.status(401).json({ error: 'That passcode is not right.' });
      return;
    }

    res.setHeader('Set-Cookie', createSessionCookie());
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('api/admin/login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
