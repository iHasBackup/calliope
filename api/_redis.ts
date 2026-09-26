import { Redis } from '@upstash/redis';

// Shared Redis client builder for the newer endpoints (content, admin
// login). api/scores.ts has its own copy predating this file — left as is
// rather than refactored, to avoid touching a working endpoint.
export function getRedis(): Redis {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      'Missing KV_REST_API_URL / KV_REST_API_TOKEN — attach Redis storage to this project in the Vercel dashboard (Storage tab) and redeploy.',
    );
  }
  return new Redis({ url, token });
}
