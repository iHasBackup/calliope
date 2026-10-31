// The full map seed, hidden places included. Server-only: files in api/
// never reach the browser, so hidden places can't leak through the site's
// JavaScript. Used when the stored content has no map yet.
import { DEFAULT_MAP, type CampaignMap, type MapPlace } from '../src/campaign/map.js';

const HIDDEN_SEED: MapPlace[] = [
  {
    id: 'wickermoor-hollow',
    name: 'Wickermoor Hollow',
    x: 19.2,
    y: 10.9,
    status: 'hidden',
    desc: 'A bowl of dead wicker in the far north, where something enormous was woven and then left to rot.',
    npcs: '',
    rumors: '',
  },
  {
    id: 'bloody-brook',
    name: 'The Bloody Brook',
    x: 66,
    y: 70.4,
    status: 'hidden',
    desc: 'A stream that runs red after rain.',
    npcs: '',
    rumors: '',
  },
  {
    id: 'mausoleum',
    name: 'Mausoleum',
    x: 78.5,
    y: 69.4,
    status: 'hidden',
    desc: 'A sealed tomb at the cemetery’s edge. The seal is on the inside.',
    npcs: '',
    rumors: '',
  },
];

export const MAP_SEED: CampaignMap = { ...DEFAULT_MAP, places: [...DEFAULT_MAP.places, ...HIDDEN_SEED] };
