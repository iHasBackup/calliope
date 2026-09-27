import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchScores } from '../api';
import type { Score } from '../types';
import { useContent } from './useContent';
import { nextSession } from './time';

export type CampaignView = 'home' | 'recaps' | 'activities';

function viewFromHash(hash: string): CampaignView {
  const h = hash.replace('#', '');
  return h === 'recaps' || h === 'activities' ? h : 'home';
}

function partyColumns(width: number, cardCount: number): number {
  if (width < 600) return 2;
  if (width < 1100) return 3;
  return Math.min(cardCount, 5);
}

export function useCampaignSite() {
  const location = useLocation();
  const navigate = useNavigate();
  const { content, loading } = useContent();

  const [view, setViewState] = useState<CampaignView>(() => viewFromHash(location.hash));
  const [openRecap, setOpenRecap] = useState<string>('');
  const [now, setNow] = useState(() => Date.now());
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  const [menuOpen, setMenuOpen] = useState(false);
  const [leader, setLeader] = useState<Score | null>(null);
  const [entries, setEntries] = useState(0);

  useEffect(() => {
    setViewState(viewFromHash(location.hash));
  }, [location.hash]);

  // Latest recap opens by default, once the real content fetch has settled.
  // useContent() renders hardcoded sample content (7 seed recaps, ids
  // r1-r7) synchronously before that — picking a default from it is unsafe
  // whenever real recaps reuse those same ids (edited in place via the CMS
  // rather than recreated), since the guard below then blocks the real
  // latest recap from ever overriding the stale pick.
  useEffect(() => {
    if (!loading && content.recaps.length && !openRecap) {
      const latest = content.recaps.slice().sort((a, b) => a.date.localeCompare(b.date)).pop();
      if (latest) setOpenRecap(latest.id);
    }
  }, [loading, content.recaps, openRecap]);

  useEffect(() => {
    let cancelled = false;
    fetchScores()
      .then((scores) => {
        if (cancelled || !scores.length) return;
        const top = scores.slice().sort((a, b) => b.words - a.words || a.time - b.time)[0];
        setLeader(top);
        setEntries(scores.length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Mobile menu: close on Escape or resize to desktop width.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);
  useEffect(() => {
    if (width >= 640 && menuOpen) setMenuOpen(false);
  }, [width, menuOpen]);

  const go = useCallback(
    (v: CampaignView) => {
      navigate({ hash: v === 'home' ? '' : v }, { replace: true });
      setMenuOpen(false);
      window.scrollTo(0, 0);
    },
    [navigate],
  );

  const session = useMemo(
    () => nextSession(new Date(now), content.schedule.weekday, content.schedule.hour, content.schedule.timezone),
    [now, content.schedule],
  );
  const countdown = useMemo(() => {
    const diff = Math.max(0, session.date.getTime() - now);
    return {
      days: String(Math.floor(diff / 86400000)).padStart(2, '0'),
      hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
    };
  }, [session, now]);

  const cardCount = content.party.length + (content.showOpenSeat ? 1 : 0);

  return {
    content,
    contentLoading: loading,
    view,
    go,
    openRecap,
    setOpenRecap,
    width,
    menuOpen,
    setMenuOpen,
    partyColumns: partyColumns(width, cardCount),
    session,
    countdown,
    leader,
    entries,
  };
}
