import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchScores } from '../api';
import type { Score } from '../types';
import { CAMPAIGN, RECAPS } from './data';
import { nextSession } from './time';

export type CampaignView = 'home' | 'recaps' | 'activities';

function viewFromHash(hash: string): CampaignView {
  const h = hash.replace('#', '');
  return h === 'recaps' || h === 'activities' ? h : 'home';
}

export function useCampaignSite() {
  const location = useLocation();
  const navigate = useNavigate();

  const [view, setViewState] = useState<CampaignView>(() => viewFromHash(location.hash));
  const [openRecap, setOpenRecap] = useState<number>(RECAPS.length); // 1-indexed, newest open by default
  const [now, setNow] = useState(() => Date.now());
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  const [leader, setLeader] = useState<Score | null>(null);
  const [entries, setEntries] = useState(0);

  useEffect(() => {
    setViewState(viewFromHash(location.hash));
  }, [location.hash]);

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

  const go = useCallback(
    (v: CampaignView) => {
      navigate({ hash: v === 'home' ? '' : v }, { replace: true });
      window.scrollTo(0, 0);
    },
    [navigate],
  );

  const session = useMemo(
    () => nextSession(new Date(now), CAMPAIGN.schedule.weekday, CAMPAIGN.schedule.hour, CAMPAIGN.schedule.timezone),
    [now],
  );
  const countdown = useMemo(() => {
    const diff = Math.max(0, session.date.getTime() - now);
    return {
      days: String(Math.floor(diff / 86400000)).padStart(2, '0'),
      hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
    };
  }, [session, now]);

  return {
    view,
    go,
    openRecap,
    setOpenRecap,
    narrowBrand: width < 380,
    session,
    countdown,
    leader,
    entries,
  };
}
