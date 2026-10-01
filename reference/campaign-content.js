(function () {
  var KEY = 'crooked-moon-content-v1';
  var DEFAULTS = {
    arcTitle: 'The Harvest Below the Hill',
    arcChapter: 'Chapter II',
    arcBlurb: 'The party has followed the missing reapers to the barrow under Gallows Hill. The village insists the harvest must be finished before the moon turns full, and nobody will say what happens if it isn\u2019t.',
    keyArtUrl: '',
    nights: 8,
    progress: 24,
    partyLevel: 4,
    summary: 'Four strangers arrived in the valley of Hollowmere on the last cart before the roads flooded. They found a village that keeps its lanterns lit all night, a church with no priest, and a hill the children are forbidden to climb.\n\nThey have since broken a witch-bottle, burned a scarecrow that would not stay still, and struck a bargain with the Crone at the edge of the wood that none of them fully understand. The moon has risen crooked every night since.',
    threads: [
      'Who took the reapers into the barrow, and why did they go willingly?',
      'The Crone\u2019s price is still unpaid. She said she would name it at the full moon.',
      'A name in the church ledger of the dead belongs to someone the party spoke to yesterday.'
    ],
    schedule: { weekday: 3, hour: 19, timezone: 'GMT+7' },
    showOpenSeat: true,
    registration: {
      open: true,
      seats: 1,
      deadline: '2026-10-31',
      modules: ['phb', 'dmg', 'tcm'],
      allowHomebrew: true,
      intro: 'One seat is open at the table. Tell us about yourself as a player and the character you want to bring to Hollowmere. The DM reads every application and will reply on Discord.',
      fitTitle: 'Campaign fit',
      fitIntro: 'The Crooked Moon is a long campaign with dark subject matter. Answer honestly. A no here is not a mark against you, just a sign this table is not the right one.',
      fitQuestions: [
        { id: 'f1', type: 'choice', required: true, prompt: 'This is a long campaign. We expect to play weekly for about a year. Can you commit to that?', options: ['Yes, I can commit for a year or more', 'Mostly, with the occasional missed session', 'I am not sure yet'] },
        { id: 'f2', type: 'choice', required: true, prompt: 'The setting is folk horror: occultism, gore, and physical and mental violence. Are you comfortable with these themes?', options: ['Yes, all of it', 'Yes, within the lines and veils I listed', 'No, this is not for me'] },
        { id: 'f3', type: 'choice', required: true, prompt: 'Are you okay with your character being mutilated, losing a limb, or even dying?', options: ['Yes, any of it', 'Injury and mutilation, but not death', 'I would rather not'] },
        { id: 'f4', type: 'text', required: false, prompt: 'Anything else about these themes the DM should know?', options: [] }
      ]
    },
    party: [
      { id: 'p1', name: 'Oberon', species: 'Species TBD', klass: 'Sorcerer', sub: 'Wild Magic', portraitUrl: '' },
      { id: 'p2', name: 'Hayden', species: 'Species TBD', klass: 'Death Knight', sub: 'Subclass TBD', portraitUrl: '' },
      { id: 'p3', name: 'Carmen', species: 'Species TBD', klass: 'Druid', sub: 'Subclass TBD', portraitUrl: '' },
      { id: 'p4', name: 'Ambary', species: 'Species TBD', klass: 'Rogue', sub: 'Subclass TBD', portraitUrl: '' }
    ],
    recaps: [
      { id: 'r1', title: 'The Last Cart to Hollowmere', date: '2026-08-05', nights: '1', body: 'The party met on the flooded road and reached the village at dusk. The innkeeper warned them to keep a lantern burning. Carmen found salt lines under every door.', tags: 'Hollowmere, The Lantern Inn' },
      { id: 'r2', title: 'Straw and Bone', date: '2026-08-12', nights: '2', body: 'A scarecrow in the east field moved between one look and the next. The party burned it, and found a child\u2019s tooth sewn into its chest.', tags: 'East field, Scarecrow' },
      { id: 'r3', title: 'The Witch-Bottle', date: '2026-08-19', nights: '3', body: 'Ambary broke a witch-bottle hidden in the church wall. That night every dog in the village howled until dawn.', tags: 'Church, Curse' },
      { id: 'r4', title: 'A Bargain in the Wood', date: '2026-08-26', nights: '4\u20135', body: 'Lost in the wood, the party accepted the Crone\u2019s help home. Her price will be named at the full moon.', tags: 'The Crone, Bargain' },
      { id: 'r5', title: 'The Ledger of the Dead', date: '2026-09-02', nights: '6', body: 'Hayden read the parish ledger and found names of villagers who are still walking the streets.', tags: 'Church, Ledger' },
      { id: 'r6', title: 'Gallows Hill', date: '2026-09-09', nights: '7', body: 'Following the missing reapers, the party climbed the forbidden hill and found the barrow door already open.', tags: 'Gallows Hill, Barrow' },
      { id: 'r7', title: 'Below the Hill', date: '2026-09-16', nights: '8', body: 'Inside the barrow the reapers were still harvesting, in the dark, a field that should not exist underground. Session ended mid-combat.', tags: 'Barrow, Cliffhanger' }
    ]
  };
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function load() {
    var base = clone(DEFAULTS);
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && typeof v === 'object') {
        Object.keys(v).forEach(function (k) { base[k] = v[k]; });
        base.schedule = Object.assign(clone(DEFAULTS.schedule), v.schedule || {});
      }
    } catch (e) {}
    return base;
  }
  function save(c) { localStorage.setItem(KEY, JSON.stringify(c)); }
  function reset() { localStorage.removeItem(KEY); }
  window.CrookedMoonContent = { KEY: KEY, DEFAULTS: DEFAULTS, clone: clone, load: load, save: save, reset: reset };
})();
