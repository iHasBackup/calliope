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
      <Header view={site.view} go={site.go} narrowBrand={site.narrowBrand} />
      {site.view === 'home' && <HomeTab go={site.go} session={site.session} countdown={site.countdown} />}
      {site.view === 'recaps' && <RecapsTab openRecap={site.openRecap} setOpenRecap={site.setOpenRecap} />}
      {site.view === 'activities' && <ActivitiesTab leader={site.leader} entries={site.entries} />}
    </div>
  );
}
