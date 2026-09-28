import './campaign.css';
import { Header } from './Header';
import { HomeTab } from './HomeTab';
import { HomeSkeleton } from './HomeSkeleton';
import { RecapsTab } from './RecapsTab';
import { RecapsSkeleton } from './RecapsSkeleton';
import { ActivitiesTab } from './ActivitiesTab';
import { useCampaignSite } from './useCampaignSite';
import { useDarkBody } from './useDarkBody';

export default function CampaignSite() {
  const site = useCampaignSite();
  useDarkBody();

  return (
    <div className="campaign-site">
      <Header view={site.view} go={site.go} width={site.width} menuOpen={site.menuOpen} setMenuOpen={site.setMenuOpen} />
      {site.view === 'home' &&
        (site.contentLoading ? (
          <HomeSkeleton />
        ) : (
          <HomeTab go={site.go} session={site.session} countdown={site.countdown} content={site.content} partyColumns={site.partyColumns} width={site.width} />
        ))}
      {site.view === 'recaps' &&
        (site.contentLoading ? (
          <RecapsSkeleton />
        ) : (
          <RecapsTab openRecap={site.openRecap} setOpenRecap={site.setOpenRecap} content={site.content} width={site.width} />
        ))}
      {site.view === 'activities' && <ActivitiesTab leader={site.leader} entries={site.entries} />}
    </div>
  );
}
