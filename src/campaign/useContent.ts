import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_CONTENT, type Content } from './content';

export function useContent() {
  const [content, setContent] = useState<Content>({ ...DEFAULT_CONTENT, updatedAt: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch('/api/content', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`GET /api/content failed: ${res.status}`);
        return res.json();
      })
      .then((c: Content) => {
        if (!cancelled) setContent(c);
      })
      .catch(() => {
        /* keep the default content if the fetch fails; callers can check `error` */
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { content, loading, error, retry };
}
