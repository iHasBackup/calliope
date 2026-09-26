// Weekly content for the campaign site. Edit this file each week — the
// spec calls for a content source the campaign owner can update; a plain
// typed module is the smallest thing that satisfies that without a CMS.

export interface PartyMember {
  id: string;
  name: string;
  species: string;
  klass: string;
  sub: string;
  portraitUrl?: string;
}

export interface Recap {
  title: string;
  date: string; // ISO yyyy-mm-dd
  nights: string; // "4" or "4-5"
  body: string;
  tags: string[];
}

export const CAMPAIGN = {
  title: 'The Crooked Moon',
  arcTitle: 'The Harvest Below the Hill',
  arcChapter: 'Chapter II',
  arcBlurb:
    'The party has followed the missing reapers to the barrow under Gallows Hill. The village insists the harvest must be finished before the moon turns full, and nobody will say what happens if it isn’t.',
  nights: 8,
  progress: 24,
  partyLevel: 4,
  showOpenSeat: true,
  keyArtUrl: undefined as string | undefined,
  summary: [
    'Four strangers arrived in the valley of Hollowmere on the last cart before the roads flooded. They found a village that keeps its lanterns lit all night, a church with no priest, and a hill the children are forbidden to climb.',
    'They have since broken a witch-bottle, burned a scarecrow that would not stay still, and struck a bargain with the Crone at the edge of the wood that none of them fully understand. The moon has risen crooked every night since.',
  ],
  threads: [
    'Who took the reapers into the barrow, and why did they go willingly?',
    'The Crone’s price is still unpaid. She said she would name it at the full moon.',
    'A name in the church ledger of the dead belongs to someone the party spoke to yesterday.',
  ],
  schedule: {
    weekday: 3, // Wednesday
    hour: 19,
    timezone: 'Asia/Jakarta',
    label: 'GMT+7',
  },
};

export const PARTY: PartyMember[] = [
  { id: 'p1', name: 'Oberon', species: 'Species TBD', klass: 'Sorcerer', sub: 'Wild Magic' },
  { id: 'p2', name: 'Hayden', species: 'Species TBD', klass: 'Death Knight', sub: 'Subclass TBD' },
  { id: 'p3', name: 'Carmen', species: 'Species TBD', klass: 'Druid', sub: 'Subclass TBD' },
  { id: 'p4', name: 'Ambary', species: 'Species TBD', klass: 'Rogue', sub: 'Subclass TBD' },
];

export const RECAPS: Recap[] = [
  {
    title: 'The Last Cart to Hollowmere',
    date: '2026-08-05',
    nights: '1',
    body: 'The party met on the flooded road and reached the village at dusk. The innkeeper warned them to keep a lantern burning. Carmen found salt lines under every door.',
    tags: ['Hollowmere', 'The Lantern Inn'],
  },
  {
    title: 'Straw and Bone',
    date: '2026-08-12',
    nights: '2',
    body: 'A scarecrow in the east field moved between one look and the next. The party burned it, and found a child’s tooth sewn into its chest.',
    tags: ['East field', 'Scarecrow'],
  },
  {
    title: 'The Witch-Bottle',
    date: '2026-08-19',
    nights: '3',
    body: 'Ambary broke a witch-bottle hidden in the church wall. That night every dog in the village howled until dawn.',
    tags: ['Church', 'Curse'],
  },
  {
    title: 'A Bargain in the Wood',
    date: '2026-08-26',
    nights: '4–5',
    body: 'Lost in the wood, the party accepted the Crone’s help home. Her price will be named at the full moon.',
    tags: ['The Crone', 'Bargain'],
  },
  {
    title: 'The Ledger of the Dead',
    date: '2026-09-02',
    nights: '6',
    body: 'Hayden read the parish ledger and found names of villagers who are still walking the streets.',
    tags: ['Church', 'Ledger'],
  },
  {
    title: 'Gallows Hill',
    date: '2026-09-09',
    nights: '7',
    body: 'Following the missing reapers, the party climbed the forbidden hill and found the barrow door already open.',
    tags: ['Gallows Hill', 'Barrow'],
  },
  {
    title: 'Below the Hill',
    date: '2026-09-16',
    nights: '8',
    body: 'Inside the barrow the reapers were still harvesting, in the dark, a field that should not exist underground. Session ended mid-combat.',
    tags: ['Barrow', 'Cliffhanger'],
  },
];

// A 7x3 decorative grid for the crossword activity card's thumbnail.
export const ACTIVITY_THUMB = '.....#.#.#.#.#.....#.#.#.#.#.....';
