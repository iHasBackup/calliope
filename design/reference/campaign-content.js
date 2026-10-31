(function () {
  var KEY = 'crooked-moon-content-v1';
  var DEFAULTS = {
    arcTitle: 'The Harvest Below the Hill',
    arcChapter: 'Chapter II',
    arcBlurb: 'The party has followed the missing reapers to the barrow under Gallows Hill. The village insists the harvest must be finished before the moon turns full, and nobody will say what happens if it isn\u2019t.',
    system: 'D&D 5e (2024)',
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
    schedule: { weekday: 3, hour: 19, timezone: 'GMT+7', start: '2026-08-05', end: '', duration: 4, changes: [] },
    map: {
      "version": 2,
      "image": "assets/wickermoor-map.png",
      "partyAt": "foxwallow",
      "path": [
        "wickermoor-village",
        "crooked-house",
        "wickermoor-village",
        "foxwallow"
      ],
      "places": [
        {
          "id": "wickermoor-village",
          "name": "Wickermoor Village",
          "x": 64.1,
          "y": 56.5,
          "status": "visited",
          "desc": "The oldest and biggest settlement, on the banks of the Silverbell River. It looks like a friendly, quiet town, but a cult of the Crooked Queen hides inside it, and its people lean on the Old Ways to survive.",
          "npcs": "",
          "rumors": ""
        },
        {
          "id": "crooked-house",
          "name": "Druskenvald Estate (the Crooked House)",
          "x": 63.4,
          "y": 49.6,
          "status": "visited",
          "desc": "The manor Phillip and Adela came to claim. Its walls hold the Lockwood family’s grief, and the Crooked Man hunts through it.",
          "npcs": "",
          "rumors": ""
        },
        {
          "id": "foxwallow",
          "name": "Foxwillow Farmland",
          "x": 78.8,
          "y": 43.7,
          "status": "visited",
          "desc": "Miles of fertile farms east of the village, and the valley’s breadbasket. The town of Foxwillow sits at the center. Right now it’s emptying out, and the crops are dying.",
          "npcs": "",
          "rumors": ""
        },
        {
          "id": "dawns-gate",
          "name": "Dawn’s Gate and the Howlers",
          "x": 30.1,
          "y": 69.4,
          "status": "known",
          "desc": "A mountain town in the foothills of a snow-capped range that walls off the west. The people hunt and mine, and live in fear of the Crimson Monastery above them.",
          "npcs": "",
          "rumors": ""
        },
        {
          "id": "crimson-monastery",
          "name": "The Crimson Monastery",
          "x": 23.1,
          "y": 63.5,
          "status": "known",
          "desc": "A fortress up in the mountains, run by Father Renathyr, a vampire abbot who burns or feeds on anyone who won’t convert to his goddess, the Crimson Rose.",
          "npcs": "",
          "rumors": ""
        },
        {
          "id": "murkwater",
          "name": "The Drowned Crossroads",
          "x": 67.9,
          "y": 31.7,
          "status": "known",
          "desc": "A black-water swamp at the valley’s lowest point. Its main town, Murkwater Bend, is a lawless refuge for people who want to escape everyone else’s rules.",
          "npcs": "",
          "rumors": ""
        },
        {
          "id": "moonsong-lake",
          "name": "Moonsong Lake and the Isle of Mourn",
          "x": 30.5,
          "y": 47,
          "status": "known",
          "desc": "A huge lake in the west where it rains for weeks. On its island, Memory’s Rest Sanatorium once healed people, and its waters now swarm with parasites.",
          "npcs": "",
          "rumors": ""
        },
        {
          "id": "harts-forest",
          "name": "Hartsblight Forest",
          "x": 35.9,
          "y": 30.5,
          "status": "known",
          "desc": "A forest in the northwest overrun by blight. Fungus is the dominant life, and the air is thick with spores.",
          "npcs": "",
          "rumors": ""
        },
        {
          "id": "maidemrst",
          "name": "Maidenmist Cemetery",
          "x": 73,
          "y": 67.5,
          "status": "known",
          "desc": "Rolling hills south of the village, packed with tombs and crypts. People say the iron gates creep a little further out every night.",
          "npcs": "",
          "rumors": ""
        },
        {
          "id": "skitterdeep",
          "name": "Skitterdeep Mine",
          "x": 44.8,
          "y": 43.7,
          "status": "known",
          "desc": "Stonoga Blackstinger’s lair, the centipede hag, where Hayden’s grandson is probably held.",
          "npcs": "",
          "rumors": ""
        },
        {
          "id": "wytchwood",
          "name": "The Wytchwood",
          "x": 52,
          "y": 22,
          "status": "known",
          "desc": "The oldest and wildest forest in the valley. Nobody who goes past the tree line comes back, and something in there calls to people across the valley.",
          "npcs": "",
          "rumors": ""
        },
        {
          "id": "silverbell-river",
          "name": "Silverbell River",
          "x": 69.8,
          "y": 59.5,
          "status": "visited",
          "desc": "The river Wickermoor Village sits on.",
          "npcs": "",
          "rumors": ""
        },
        {
          "id": "wickermoor-hollow",
          "name": "Wickermoor Hollow",
          "x": 19.2,
          "y": 10.9,
          "status": "hidden",
          "desc": "A bowl of dead wicker in the far north, where something enormous was woven and then left to rot.",
          "npcs": "",
          "rumors": ""
        },
        {
          "id": "bloody-brook",
          "name": "The Bloody Brook",
          "x": 66,
          "y": 70.4,
          "status": "hidden",
          "desc": "A stream that runs red after rain.",
          "npcs": "",
          "rumors": ""
        },
        {
          "id": "mausoleum",
          "name": "Mausoleum",
          "x": 78.5,
          "y": 69.4,
          "status": "hidden",
          "desc": "A sealed tomb at the cemetery’s edge. The seal is on the inside.",
          "npcs": "",
          "rumors": ""
        }
      ]
    },
    showOpenSeat: true,
    registration: {
      open: true,
      seats: 1,
      deadline: '2026-10-31',
      modules: ['phb', 'tcm'],
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
        if (!v.map || v.map.version !== DEFAULTS.map.version) base.map = clone(DEFAULTS.map);
      }
    } catch (e) {}
    return base;
  }
  function save(c) { localStorage.setItem(KEY, JSON.stringify(c)); }
  function reset() { localStorage.removeItem(KEY); }
  window.CrookedMoonContent = { KEY: KEY, DEFAULTS: DEFAULTS, clone: clone, load: load, save: save, reset: reset };
})();
