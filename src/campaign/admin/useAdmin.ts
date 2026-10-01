import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_CONTENT, type Content, type PartyMember, type Recap } from '../content';
import type { Application, ApplicationStatus } from '../application';

export type Section = 'campaign' | 'schedule' | 'party' | 'recaps' | 'quests' | 'registration' | 'applications';

const uid = () => Math.random().toString(36).slice(2, 9);

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<{ status: number; body: T }> {
  const res = await fetch(url, { cache: 'no-store', ...init });
  const body = (await res.json().catch(() => null)) as T;
  return { status: res.status, body };
}

export function useAdmin() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [codeErr, setCodeErr] = useState('');

  const [draft, setDraft] = useState<Content | null>(null);
  const [saved, setSaved] = useState<Content | null>(null);
  const [section, setSection] = useState<Section>('campaign');
  const [openRecap, setOpenRecap] = useState('');
  const [openApp, setOpenApp] = useState('');
  const [apps, setApps] = useState<Application[]>([]);
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState('');
  const [conflict, setConflict] = useState<Content | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>();

  const loadContent = useCallback(async () => {
    const { body } = await jsonFetch<Content>('/api/content');
    setDraft(body);
    setSaved(body);
  }, []);

  const loadApps = useCallback(async () => {
    const { body } = await jsonFetch<Application[]>('/api/applications');
    setApps(Array.isArray(body) ? body : []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    jsonFetch<{ ok: boolean }>('/api/admin/session')
      .then(({ body }) => {
        if (cancelled) return;
        if (body?.ok) {
          setUnlocked(true);
          return Promise.all([loadContent(), loadApps()]);
        }
      })
      .finally(() => {
        if (!cancelled) setCheckingSession(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadContent, loadApps]);

  // Applications are edited elsewhere (e.g. the DM reviewing on another
  // device) more often than campaign content is, so refresh the list
  // whenever the tab regains focus.
  useEffect(() => {
    if (!unlocked) return;
    const onVis = () => {
      if (!document.hidden) loadApps();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [unlocked, loadApps]);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isDirty = !!draft && !!saved && JSON.stringify(draft) !== JSON.stringify(saved);

  const update = useCallback((fn: (c: Content) => void) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = clone(prev);
      fn(next);
      return next;
    });
  }, []);

  const save = useCallback(async () => {
    if (!draft || saving) return;
    if (!isDirty) return;
    setSaving(true);
    setConflict(null);
    try {
      const { status, body } = await jsonFetch<Content & { current?: Content; error?: string }>('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (status === 409 && body.current) {
        setConflict(body.current);
        return;
      }
      if (status !== 200) return;
      setDraft(body);
      setSaved(body);
      setFlash('Saved');
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlash(''), 2000);
    } finally {
      setSaving(false);
    }
  }, [draft, saving, isDirty]);

  // Ctrl/Cmd+S saves; beforeunload warns on unsaved changes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's' && unlocked) {
        e.preventDefault();
        save();
      }
    };
    const onUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [unlocked, save, isDirty]);

  const unlock = useCallback(async () => {
    const { status } = await jsonFetch<{ ok?: boolean; error?: string }>('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: code }),
    });
    if (status === 200) {
      setUnlocked(true);
      setCode('');
      setCodeErr('');
      await Promise.all([loadContent(), loadApps()]);
    } else if (status === 429) {
      setCodeErr('Too many attempts. Try again in a few minutes.');
    } else {
      setCodeErr('That passcode is not right.');
    }
  }, [code, loadContent, loadApps]);

  const revertToSaved = useCallback(() => {
    if (!saved) return;
    if (!window.confirm('Discard unsaved changes and revert to the last saved version?')) return;
    setDraft(clone(saved));
  }, [saved]);

  const acceptConflict = useCallback(() => {
    if (!conflict) return;
    setDraft(conflict);
    setSaved(conflict);
    setConflict(null);
  }, [conflict]);

  // ---- section-specific mutators ----

  const addMember = useCallback(() => {
    update((c) => {
      c.party.push({ id: uid(), name: '', species: '', klass: '', sub: '', portraitUrl: '' });
    });
  }, [update]);

  const removeMember = useCallback(
    (i: number, member: PartyMember) => {
      if (!window.confirm(`Remove ${member.name || 'this member'} from the party?`)) return;
      update((c) => {
        c.party.splice(i, 1);
      });
    },
    [update],
  );

  const addRecap = useCallback(() => {
    const id = uid();
    update((c) => {
      const last = c.recaps.map((r) => r.date).filter(Boolean).sort().pop();
      const d = last ? new Date(last + 'T12:00:00') : new Date();
      if (last) d.setDate(d.getDate() + 7);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      c.recaps.push({ id, title: '', date: iso, nights: '', body: '', tags: '' });
    });
    setOpenRecap(id);
    setSection('recaps');
  }, [update]);

  const removeRecap = useCallback(
    (i: number, recap: Recap) => {
      if (!window.confirm(`Delete "${recap.title || 'this recap'}"?`)) return;
      update((c) => {
        c.recaps.splice(i, 1);
      });
    },
    [update],
  );

  const addThread = useCallback(() => {
    update((c) => {
      c.threads.push('');
    });
  }, [update]);

  const removeThread = useCallback(
    (i: number) => {
      update((c) => {
        c.threads.splice(i, 1);
      });
    },
    [update],
  );

  // Status changes (and the party sync that accepting triggers) save
  // immediately on the server — there's no draft/Save step for applications.
  const changeStatus = useCallback(
    async (app: Application, status: ApplicationStatus) => {
      setApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)));
      const { status: resStatus, body } = await jsonFetch<{ application: Application; content?: Content }>(
        `/api/applications?id=${app.id}`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) },
      );
      if (resStatus !== 200 || !body?.application) return;
      setApps((prev) => prev.map((a) => (a.id === body.application.id ? body.application : a)));
      // The party member this status change added/removed is folded into
      // our local draft/saved only if there were no other unsaved edits —
      // otherwise the next explicit Save surfaces the usual 409 conflict.
      if (body.content) {
        const wasClean = !!draft && !!saved && JSON.stringify(draft) === JSON.stringify(saved);
        if (wasClean) {
          setDraft(body.content);
          setSaved(body.content);
        }
      }
    },
    [draft, saved],
  );

  const deleteApplication = useCallback(async (app: Application) => {
    if (!window.confirm(`Delete the application from ${app.discord || app.name || 'this player'}?`)) return;
    await jsonFetch(`/api/applications?id=${app.id}`, { method: 'DELETE' });
    setApps((prev) => prev.filter((a) => a.id !== app.id));
    setOpenApp((prev) => (prev === app.id ? '' : prev));
  }, []);

  return {
    checkingSession,
    unlocked,
    code,
    setCode,
    codeErr,
    setCodeErr,
    unlock,
    draft: draft ?? { ...DEFAULT_CONTENT, updatedAt: 0 },
    hasDraft: !!draft,
    isDirty,
    saving,
    flash,
    conflict,
    acceptConflict,
    section,
    setSection,
    openRecap,
    setOpenRecap,
    openApp,
    setOpenApp,
    apps,
    width,
    update,
    save,
    revertToSaved,
    addMember,
    removeMember,
    addRecap,
    removeRecap,
    addThread,
    removeThread,
    changeStatus,
    deleteApplication,
  };
}
