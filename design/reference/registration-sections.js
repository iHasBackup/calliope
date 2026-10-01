(function () {
  var APPS_KEY = 'crooked-moon-applications-v1';
  var DRAFT_KEY = 'crooked-moon-application-draft-v1';

  // Standard sections (01, 03, 04) are shared by every campaign. Only campaign fit (02) lives in campaign content.
  var EXPERIENCE = [
    { v: 'first', label: 'First timer', desc: 'Never played before' },
    { v: 'newbie', label: 'Newbie', desc: 'A one-shot or a handful of sessions' },
    { v: 'experienced', label: 'Experienced', desc: 'Played through at least one campaign' },
    { v: 'veteran', label: 'Veteran', desc: 'Years at the table, maybe behind the screen' }
  ];
  var ASPECTS = [
    { v: 'roleplay', label: 'Roleplay', desc: 'Voices, drama, talking your way through' },
    { v: 'exploring', label: 'Exploring', desc: 'Maps, ruins, secrets and lore' },
    { v: 'combat', label: 'Combat', desc: 'Tactics, builds and big fights' }
  ];
  var PLAYSTYLES = [
    { v: 'roleplayer', label: 'The Roleplayer', desc: 'Fully inhabits their character, does voices, stays in character, avoids metagaming.' },
    { v: 'storyteller', label: 'The Storyteller', desc: 'Here for plot twists, character arcs, and emotional stakes. Gets invested in lore and consequences.' },
    { v: 'explorer', label: 'The Explorer', desc: 'Driven by curiosity. Wants to discover hidden rooms, secret lore, and uncharted locations.' },
    { v: 'power-gamer', label: 'The Power Gamer', desc: 'Builds the most mechanically efficient character. Wants to feel powerful and beat challenges optimally.' },
    { v: 'tactician', label: 'The Tactician', desc: 'Treats combat like chess. Thinks ahead, positions carefully, loves party synergies.' },
    { v: 'instigator', label: 'The Instigator', desc: 'Makes bold, sometimes chaotic choices to push the story forward. Kicks doors, accepts every quest.' },
    { v: 'watcher', label: 'The Watcher', desc: 'Mostly here for the social experience. Engaged but quiet, rarely drives the story.' },
    { v: 'rules-lawyer', label: 'The Rules Lawyer', desc: 'Has the PHB memorized and will cite page numbers mid-session.' },
    { v: 'slayer', label: 'The Slayer', desc: 'Combat is the whole game. Less interested in roleplay or exploration.' },
    { v: 'thinker', label: 'The Thinker', desc: 'Loves puzzles and mysteries. Takes notes, connects dots the rest of the party missed.' },
    { v: 'completionist', label: 'The Completionist', desc: 'Must finish every side quest and find every secret. Hates leaving content unexplored.' },
    { v: 'specialist', label: 'The Specialist', desc: 'Always plays the same character archetype and knows it deeply.' },
    { v: 'socializer', label: 'The Socializer', desc: 'Thrives in NPC interactions and political intrigue. Avoids combat when possible.' },
    { v: 'inventor', label: 'The Inventor', desc: 'Solves problems in unexpected ways. "Can I use the giant crab as a battering ram?"' },
    { v: 'casual', label: 'The Casual', desc: 'Here to hang out with friends. Zero stress, maximum vibes.' },
    { v: 'help', label: 'Help me figure it out', desc: 'Let the DM read your style over the first sessions' }
  ];
  var BOND = [
    { v: 'fast', label: 'I connect fast', desc: 'I like building in-character bonds from session one' },
    { v: 'warm', label: 'I warm up over time', desc: 'Give me a few sessions to find my footing' },
    { v: 'follow', label: 'I follow the group', desc: 'I would rather support than lead' },
    { v: 'lone', label: 'Lone wolf, but loyal', desc: 'My character keeps apart, but I stay with the party' },
    { v: 'other', label: 'Other', desc: 'Something else. Tell us below.' }
  ];
  var CONFLICT = [
    { v: 'open', label: 'Talk it out with the group', desc: 'Raise it at the table and settle it together' },
    { v: 'dm', label: 'Message the DM privately', desc: 'Let the DM handle it quietly' },
    { v: 'direct', label: 'One-on-one with the person', desc: 'Sort it out directly after the session' },
    { v: 'pause', label: 'Take a break first', desc: 'Pause the game and come back with a cool head' },
    { v: 'other', label: 'Other', desc: 'Something else. Tell us below.' }
  ];
  var VIBE_QS = [
    {
      "id": "spotlight",
      "label": "How do you handle spotlight, are you comfortable sharing it or do you like leading scenes?",
      "opts": [
        {
          "v": "a",
          "label": "I prefer leading and driving scenes forward"
        },
        {
          "v": "b",
          "label": "I'm happy sharing equally with everyone"
        },
        {
          "v": "c",
          "label": "I prefer supporting others and stepping in when needed"
        },
        {
          "v": "d",
          "label": "I hang back unless the moment calls for me"
        },
        {
          "v": "other",
          "label": "Other"
        }
      ]
    },
    {
      "id": "bigMoment",
      "label": "What do you do when another player is having a big moment?",
      "opts": [
        {
          "v": "a",
          "label": "I sit back and let them shine fully"
        },
        {
          "v": "b",
          "label": "I engage and react to make their moment feel more impactful"
        },
        {
          "v": "c",
          "label": "I might jump in if I see a way to contribute"
        },
        {
          "v": "d",
          "label": "I find it hard to hold back but I try"
        },
        {
          "v": "other",
          "label": "Other"
        }
      ]
    },
    {
      "id": "pcImpact",
      "label": "How do you feel about other players' characters making decisions that affect yours?",
      "opts": [
        {
          "v": "a",
          "label": "Totally fine, that's part of the game"
        },
        {
          "v": "b",
          "label": "Fine as long as we talk about it beforehand"
        },
        {
          "v": "c",
          "label": "Okay in the moment but I'd want to debrief after"
        },
        {
          "v": "d",
          "label": "I prefer my character's agency stays with me"
        },
        {
          "v": "other",
          "label": "Other"
        }
      ]
    },
    {
      "id": "raw",
      "label": "How do you feel about rulings that go against RAW in the moment?",
      "opts": [
        {
          "v": "a",
          "label": "No problem, DM's call is final at the table"
        },
        {
          "v": "b",
          "label": "Fine as long as it's consistent"
        },
        {
          "v": "c",
          "label": "I'd want a quick explanation but I'll go with it"
        },
        {
          "v": "d",
          "label": "I prefer we check the rules before deciding"
        },
        {
          "v": "other",
          "label": "Other"
        }
      ]
    },
    {
      "id": "secrets",
      "label": "Are you okay with secrets being kept from your character that you as a player might suspect?",
      "opts": [
        {
          "v": "a",
          "label": "Absolutely, I love dramatic irony"
        },
        {
          "v": "b",
          "label": "Yes, as long as the secret pays off eventually"
        },
        {
          "v": "c",
          "label": "I'm okay with it but I find it hard not to act on what I know"
        },
        {
          "v": "d",
          "label": "I prefer player and character knowledge to stay aligned"
        },
        {
          "v": "other",
          "label": "Other"
        }
      ]
    }
  ];
  var CONDUCT = {
    label: 'Do you understand and agree with the table\u2019s conduct policy?',
    help: 'This is a collaborative storytelling game, every player\u2019s experience matters equally. If behaviour is negatively affecting the table, a private conversation will happen first. If the issue continues, you may be asked to leave the campaign.',
    agree: 'Understood and agreed'
  };
  var SPECIES = ['Aasimar', 'Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Goliath', 'Halfling', 'Human', 'Orc', 'Tiefling'].map(function (s) { return { v: s.toLowerCase(), label: s }; }).concat([{ v: 'other', label: 'Other' }]);
  var CLASSES = [
    { v: 'barbarian', label: 'Barbarian', hd: 'd12', ab: 'STR', role: 'Martial', subs: ['Berserker', 'Wild Heart', 'World Tree', 'Zealot'] },
    { v: 'bard', label: 'Bard', hd: 'd8', ab: 'CHA', role: 'Caster', subs: ['Dance', 'Glamour', 'Lore', 'Valor'] },
    { v: 'cleric', label: 'Cleric', hd: 'd8', ab: 'WIS', role: 'Caster', subs: ['Life', 'Light', 'Trickery', 'War'] },
    { v: 'druid', label: 'Druid', hd: 'd8', ab: 'WIS', role: 'Caster', subs: ['Land', 'Moon', 'Sea', 'Stars'] },
    { v: 'fighter', label: 'Fighter', hd: 'd10', ab: 'STR / DEX', role: 'Martial', subs: ['Battle Master', 'Champion', 'Eldritch Knight', 'Psi Warrior'] },
    { v: 'monk', label: 'Monk', hd: 'd8', ab: 'DEX / WIS', role: 'Martial', subs: ['Mercy', 'Shadow', 'Elements', 'Open Hand'] },
    { v: 'paladin', label: 'Paladin', hd: 'd10', ab: 'STR / CHA', role: 'Half-caster', subs: ['Devotion', 'Glory', 'Ancients', 'Vengeance'] },
    { v: 'ranger', label: 'Ranger', hd: 'd10', ab: 'DEX / WIS', role: 'Half-caster', subs: ['Beast Master', 'Fey Wanderer', 'Gloom Stalker', 'Hunter'] },
    { v: 'rogue', label: 'Rogue', hd: 'd8', ab: 'DEX', role: 'Martial', subs: ['Arcane Trickster', 'Assassin', 'Soulknife', 'Thief'] },
    { v: 'sorcerer', label: 'Sorcerer', hd: 'd6', ab: 'CHA', role: 'Caster', subs: ['Aberrant', 'Clockwork', 'Draconic', 'Wild Magic'] },
    { v: 'warlock', label: 'Warlock', hd: 'd8', ab: 'CHA', role: 'Caster', subs: ['Archfey', 'Celestial', 'Fiend', 'Great Old One'] },
    { v: 'wizard', label: 'Wizard', hd: 'd6', ab: 'INT', role: 'Caster', subs: ['Abjurer', 'Diviner', 'Evoker', 'Illusionist'] },
    { v: 'other', label: 'Other', hd: '—', ab: '—', role: 'Homebrew', subs: [] }
  ];

  function read(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function lab(list, v) { var f = list.filter(function (x) { return x.v === v; })[0]; return f ? f.label : (v || ''); }
  function many(list, arr) { return (arr || []).map(function (v) { return lab(list, v); }).join(', '); }
  function withNote(main, note) { return [main, (note || '').trim()].filter(Boolean).join('\n\n'); }

  function speciesOf(a) { var M = window.CrookedMoonClassModules; return a.species === 'other' ? (a.speciesOther || '').trim() : lab(M ? M.allSpecies() : SPECIES, a.species); }
  // a.classes = [{ klass, klassOther, sub, subOther, lv }]; legacy drafts carry a single klass/sub on the root.
  function classesOf(a) {
    if (Array.isArray(a.classes) && a.classes.length) return a.classes;
    return a.klass ? [{ klass: a.klass, klassOther: a.klassOther, sub: a.sub, subOther: a.subOther, lv: null }] : [];
  }
  function allClasses() { var M = window.CrookedMoonClassModules; return M ? M.BASE : CLASSES; }
  function entryClass(e) { return e.klass === 'other' ? (e.klassOther || '').trim() : lab(allClasses(), e.klass); }
  function entrySub(e) { return e.sub === 'other' ? (e.subOther || '').trim() : e.sub === 'undecided' ? 'Undecided' : (e.sub || ''); }
  function isMulti(a) { return !!a.multiclass && classesOf(a).length > 1; }
  function classOf(a) {
    var m = isMulti(a);
    return classesOf(a).map(function (e) { var n = entryClass(e); return n && m && e.lv ? n + ' ' + e.lv : n; }).filter(Boolean).join(' / ');
  }
  function subOf(a) {
    var list = classesOf(a), m = isMulti(a);
    return list.map(function (e) { var s = entrySub(e); return s && m ? entryClass(e) + ': ' + s : s; }).filter(Boolean).join(' / ');
  }

  function summarize(a, reg) {
    var fitQs = a.fitSnapshot || ((reg && reg.fitQuestions) || []).filter(function (q) { return String(q.prompt || '').trim(); });
    return [
      { n: '01', step: 0, title: 'General information', items: [
        { q: 'Discord', a: a.discord },
        { q: 'D&D experience', a: lab(EXPERIENCE, a.experience) },
        { q: 'Enjoys most', a: many(ASPECTS, a.aspects) },
        { q: 'Playstyle', a: many(PLAYSTYLES, a.playstyle) },
        { q: 'Lines', a: a.lines },
        { q: 'Veils', a: a.veils },
        { q: 'Why them', a: a.pitch }
      ] },
      { n: '02', step: 1, title: (reg && reg.fitTitle) || 'Campaign fit', items: fitQs.map(function (q) { return { q: q.prompt, a: (a.fit || {})[q.id] }; }) },
      { n: '03', step: 2, title: 'Vibe check', items: [
        { q: 'Bonding with players', a: withNote(lab(BOND, a.bond), a.bondNote) },
        { q: 'Handling conflict', a: withNote(lab(CONFLICT, a.conflict), a.conflictNote) }
      ].concat(VIBE_QS.map(function (v) { return { q: v.label, a: withNote(lab(v.opts, a[v.id]), a[v.id + 'Note']) }; })).concat([{ q: 'Conduct policy', a: (a.conduct || []).indexOf('agreed') >= 0 ? CONDUCT.agree : '' }]) },
      { n: '04', step: 3, title: 'Your character', items: [
        { q: 'Name', a: a.name },
        { q: 'Species', a: speciesOf(a) },
        { q: isMulti(a) ? 'Multiclass' : 'Class', a: classOf(a) },
        { q: 'Subclass', a: subOf(a) },
        { q: 'Backstory', a: a.backstory },
        { q: 'Face claim', a: a.faceUrl }
      ] }
    ].map(function (s) {
      s.items = s.items.map(function (it) { var v = String(it.a || '').trim(); return { q: it.q, a: v || '—', empty: !v }; });
      return s;
    });
  }

  window.CrookedMoonRegistration = {
    EXPERIENCE: EXPERIENCE, ASPECTS: ASPECTS, PLAYSTYLES: PLAYSTYLES, BOND: BOND, CONFLICT: CONFLICT, SPECIES: SPECIES, CLASSES: CLASSES, VIBE_QS: VIBE_QS, CONDUCT: CONDUCT,
    speciesOf: speciesOf, classOf: classOf, subOf: subOf, classesOf: classesOf, entryClass: entryClass, entrySub: entrySub, summarize: summarize,
    loadDraft: function () { return read(DRAFT_KEY, null); },
    saveDraft: function (d) { write(DRAFT_KEY, d); },
    clearDraft: function () { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} },
    loadApps: function () { var v = read(APPS_KEY, []); return Array.isArray(v) ? v : []; },
    saveApps: function (list) { write(APPS_KEY, list); },
    submit: function (app) { var l = this.loadApps(); l.push(app); write(APPS_KEY, l); },
    APPS_KEY: APPS_KEY
  };
})();
