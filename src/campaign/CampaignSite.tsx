import './campaign.css';
import { Header } from './Header';
import { HomeTab } from './HomeTab';
import { RecapsTab } from './RecapsTab';
import { ActivitiesTab } from './ActivitiesTab';
import { useCampaignSite } from './useCampaignSite';
import { useDarkBody } from './useDarkBody';

export default function CampaignSite() {
  const site = useCampaignSite();
  useDarkBody();

  return (
    <div className="campaign-site">
      <Header view={site.view} go={site.go} width={site.width} menuOpen={site.menuOpen} setMenuOpen={site.setMenuOpen} />
      {site.view === 'home' && (
        <HomeTab go={site.go} session={site.session} countdown={site.countdown} content={site.content} partyColumns={site.partyColumns} width={site.width} />
      )}
      {site.view === 'recaps' && (
        <RecapsTab openRecap={site.openRecap} setOpenRecap={site.setOpenRecap} content={site.content} width={site.width} />
      )}
      {site.view === 'activities' && <ActivitiesTab leader={site.leader} entries={site.entries} />}
    </div>
  );
}
