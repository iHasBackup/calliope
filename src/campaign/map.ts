// The Wickermoor map: pins, the party's location and route, and the fog of
// war on the public page. Shared by the site, the admin and api/content.ts,
// so dependency-free. Coordinates are percentages of the map image.

export type PlaceStatus = 'hidden' | 'known' | 'visited';

export interface MapPlace {
  id: string;
  name: string;
  x: number; // % of the image width
  y: number; // % of the image height
  status: PlaceStatus; // shown as Hidden / Heard of / Visited
  desc: string;
  npcs: string; // one per line, "Name — role"
  rumors: string; // one per line
}

export interface CampaignMap {
  image: string;
  partyAt: string; // place id, '' for nowhere
  path: string[]; // place ids, in travel order
  places: MapPlace[];
}

export const MAP_IMAGE = '/map/wickermoor.jpg';
export const MAP_ASPECT = '1561 / 1008';

// Seed from the design handoff (design/CHANGES-wickermoor-map.md); names and
// descriptions are the DM's. Only places players may see are here, because
// this file ships in the site's JavaScript. The hidden seed places live in
// api/_mapSeed.ts, which never reaches the browser.
export const DEFAULT_MAP: CampaignMap = {
  image: MAP_IMAGE,
  partyAt: 'foxwallow',
  path: ['wickermoor-village', 'crooked-house', 'wickermoor-village', 'foxwallow'],
  places: [
    {
      id: 'wickermoor-village',
      name: 'Wickermoor Village',
      x: 64.1,
      y: 56.5,
      status: 'visited',
      desc: 'The oldest and biggest settlement, on the banks of the Silverbell River. It looks like a friendly, quiet town, but a cult of the Crooked Queen hides inside it, and its people lean on the Old Ways to survive.',
      npcs: '',
      rumors: '',
    },
    {
      id: 'crooked-house',
      name: 'Druskenvald Estate (the Crooked House)',
      x: 63.4,
      y: 49.6,
      status: 'visited',
      desc: 'The manor Phillip and Adela came to claim. Its walls hold the Lockwood family’s grief, and the Crooked Man hunts through it.',
      npcs: '',
      rumors: '',
    },
    {
      id: 'foxwallow',
      name: 'Foxwillow Farmland',
      x: 78.8,
      y: 43.7,
      status: 'visited',
      desc: 'Miles of fertile farms east of the village, and the valley’s breadbasket. The town of Foxwillow sits at the center. Right now it’s emptying out, and the crops are dying.',
      npcs: '',
      rumors: '',
    },
    {
      id: 'dawns-gate',
      name: 'Dawn’s Gate and the Howlers',
      x: 30.1,
      y: 69.4,
      status: 'known',
      desc: 'A mountain town in the foothills of a snow-capped range that walls off the west. The people hunt and mine, and live in fear of the Crimson Monastery above them.',
      npcs: '',
      rumors: '',
    },
    {
      id: 'crimson-monastery',
      name: 'The Crimson Monastery',
      x: 23.1,
      y: 63.5,
      status: 'known',
      desc: 'A fortress up in the mountains, run by Father Renathyr, a vampire abbot who burns or feeds on anyone who won’t convert to his goddess, the Crimson Rose.',
      npcs: '',
      rumors: '',
    },
    {
      id: 'murkwater',
      name: 'The Drowned Crossroads',
      x: 67.9,
      y: 31.7,
      status: 'known',
      desc: 'A black-water swamp at the valley’s lowest point. Its main town, Murkwater Bend, is a lawless refuge for people who want to escape everyone else’s rules.',
      npcs: '',
      rumors: '',
    },
    {
      id: 'moonsong-lake',
      name: 'Moonsong Lake and the Isle of Mourn',
      x: 30.5,
      y: 47,
      status: 'known',
      desc: 'A huge lake in the west where it rains for weeks. On its island, Memory’s Rest Sanatorium once healed people, and its waters now swarm with parasites.',
      npcs: '',
      rumors: '',
    },
    {
      id: 'harts-forest',
      name: 'Hartsblight Forest',
      x: 35.9,
      y: 30.5,
      status: 'known',
      desc: 'A forest in the northwest overrun by blight. Fungus is the dominant life, and the air is thick with spores.',
      npcs: '',
      rumors: '',
    },
    {
      id: 'maidemrst',
      name: 'Maidenmist Cemetery',
      x: 73,
      y: 67.5,
      status: 'known',
      desc: 'Rolling hills south of the village, packed with tombs and crypts. People say the iron gates creep a little further out every night.',
      npcs: '',
      rumors: '',
    },
    {
      id: 'skitterdeep',
      name: 'Skitterdeep Mine',
      x: 44.8,
      y: 43.7,
      status: 'known',
      desc: 'Stonoga Blackstinger’s lair, the centipede hag, where Hayden’s grandson is probably held.',
      npcs: '',
      rumors: '',
    },
    {
      id: 'wytchwood',
      name: 'The Wytchwood',
      x: 52,
      y: 22,
      status: 'known',
      desc: 'The oldest and wildest forest in the valley. Nobody who goes past the tree line comes back, and something in there calls to people across the valley.',
      npcs: '',
      rumors: '',
    },
    {
      id: 'silverbell-river',
      name: 'Silverbell River',
      x: 69.8,
      y: 59.5,
      status: 'visited',
      desc: 'The river Wickermoor Village sits on.',
      npcs: '',
      rumors: '',
    },
  ],
};

const LIMITS = { places: 100, path: 200, name: 200, text: 3000, id: 60 };

function str(v: unknown, max: number): string {
  return (typeof v === 'string' ? v : '').trim().slice(0, max);
}
function pct(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? Math.round(Math.max(0, Math.min(100, n)) * 10) / 10 : 50;
}
export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, LIMITS.id);

/** Never throws; a document saved before the map existed gets `seed`. */
export function sanitizeMap(input: unknown, seed: CampaignMap = DEFAULT_MAP): CampaignMap {
  if (!input || typeof input !== 'object') return JSON.parse(JSON.stringify(seed));
  const m = input as Record<string, unknown>;
  const raw = Array.isArray(m.places) ? m.places : [];
  const seen = new Set<string>();
  const places: MapPlace[] = [];
  raw.slice(0, LIMITS.places).forEach((r, i) => {
    const p = (r && typeof r === 'object' ? r : {}) as Record<string, unknown>;
    let id = slug(str(p.id, LIMITS.id)) || `place-${i + 1}`;
    while (seen.has(id)) id = `${id}-${i}`;
    seen.add(id);
    places.push({
      id,
      name: str(p.name, LIMITS.name),
      x: pct(p.x),
      y: pct(p.y),
      status: p.status === 'visited' || p.status === 'known' ? p.status : 'hidden',
      desc: str(p.desc, LIMITS.text),
      npcs: str(p.npcs, LIMITS.text),
      rumors: str(p.rumors, LIMITS.text),
    });
  });
  const ids = new Set(places.map((p) => p.id));
  const partyAt = str(m.partyAt, LIMITS.id);
  return {
    image: str(m.image, 2000) || MAP_IMAGE,
    partyAt: ids.has(partyAt) ? partyAt : '',
    path: (Array.isArray(m.path) ? m.path : [])
      .map((x) => str(x, LIMITS.id))
      .filter((x) => ids.has(x))
      .slice(0, LIMITS.path),
    places,
  };
}

/** What visitors may see. Hidden places never leave the server: they are
 * dropped with their route stops. The one exception is the party's own spot,
 * which keeps its name and position (the party marker sits there) but none
 * of its details. */
export function publicMap(map: CampaignMap): CampaignMap {
  const places = map.places.flatMap((p) => {
    if (p.status !== 'hidden') return [p];
    if (p.id === map.partyAt) return [{ ...p, desc: '', npcs: '', rumors: '' }];
    return [];
  });
  const visible = new Set(map.places.filter((p) => p.status !== 'hidden').map((p) => p.id));
  return { ...map, places, path: map.path.filter((id) => visible.has(id)) };
}

/** Places counted as discovered: visited or heard of. */
export const discovered = (map: CampaignMap) => map.places.filter((p) => p.status !== 'hidden');
