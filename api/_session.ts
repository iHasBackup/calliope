// Shared admin-session helpers for api/admin/login.ts and api/content.ts.
// Filename prefixed with `_` so Vercel doesn't turn it into a route of its
// own (its documented convention for api/ helper files).
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const COOKIE_NAME = 'cm_admin';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h — long enough for a prep session

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error('Missing ADMIN_SESSION_SECRET.');
  return s;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

export function createSessionCookie(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const value = `${expires}.${sign(String(expires))}`;
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  return `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function hasValidSession(req: VercelRequest): boolean {
  const cookies = parseCookies(req.headers.cookie);
  const raw = cookies[COOKIE_NAME];
  if (!raw) return false;
  const dot = raw.indexOf('.');
  if (dot === -1) return false;
  const expires = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (Number(expires) < Date.now()) return false;
  const expected = sign(expires);
  const a = Buffer.from(sig, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export function requireSession(req: VercelRequest, res: VercelResponse): boolean {
  if (hasValidSession(req)) return true;
  res.status(401).json({ error: 'Not signed in.' });
  return false;
}
