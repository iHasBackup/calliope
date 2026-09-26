import './campaign.css';
import { Header } from './Header';
import { HomeTab } from './HomeTab';
import { RecapsTab } from './RecapsTab';
import { ActivitiesTab } from './ActivitiesTab';
import { useCampaignSite } from './useCampaignSite';

export default function CampaignSite() {
  const site = useCampaignSite();

  return (
    <div className="campaign-site">
      <Header view={site.view} go={site.go} width={site.width} menuOpen={site.menuOpen} setMenuOpen={site.setMenuOpen} />
      {site.view === 'home' && (
        <HomeTab go={site.go} session={site.session} countdown={site.countdown} content={site.content} partyColumns={site.partyColumns} />
      )}
      {site.view === 'recaps' && <RecapsTab openRecap={site.openRecap} setOpenRecap={site.setOpenRecap} content={site.content} />}
      {site.view === 'activities' && <ActivitiesTab leader={site.leader} entries={site.entries} />}
    </div>
  );
}
