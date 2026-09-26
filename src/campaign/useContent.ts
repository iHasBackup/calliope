import { useEffect, useState } from 'react';
import { DEFAULT_CONTENT, type Content } from './content';

export function useContent() {
  const [content, setContent] = useState<Content>({ ...DEFAULT_CONTENT, updatedAt: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/content')
      .then((res) => {
        if (!res.ok) throw new Error(`GET /api/content failed: ${res.status}`);
        return res.json();
      })
      .then((c: Content) => {
        if (!cancelled) setContent(c);
      })
      .catch(() => {
        /* keep the default content if the fetch fails */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { content, loading };
}
