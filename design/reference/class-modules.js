// Class & subclass sources. Turn modules on per campaign in Campaign Admin > Registration.
// To change a list, edit MODULES below and publish this file.
(function () {
  var BASE = [
    { v: 'artificer', label: 'Artificer', hd: 'd8', ab: 'INT', role: 'Half-caster', src: 'efa' },
    { v: 'barbarian', label: 'Barbarian', hd: 'd12', ab: 'STR', role: 'Martial', src: 'phb' },
    { v: 'bard', label: 'Bard', hd: 'd8', ab: 'CHA', role: 'Caster', src: 'phb' },
    { v: 'cleric', label: 'Cleric', hd: 'd8', ab: 'WIS', role: 'Caster', src: 'phb' },
    { v: 'druid', label: 'Druid', hd: 'd8', ab: 'WIS', role: 'Caster', src: 'phb' },
    { v: 'fighter', label: 'Fighter', hd: 'd10', ab: 'STR / DEX', role: 'Martial', src: 'phb' },
    { v: 'monk', label: 'Monk', hd: 'd8', ab: 'DEX / WIS', role: 'Martial', src: 'phb' },
    { v: 'monster-hunter', label: 'Monster Hunter', hd: 'd10', ab: 'STR / DEX', role: 'Martial', src: 'gh' },
    { v: 'paladin', label: 'Paladin', hd: 'd10', ab: 'STR / CHA', role: 'Half-caster', src: 'phb' },
    { v: 'ranger', label: 'Ranger', hd: 'd10', ab: 'DEX / WIS', role: 'Half-caster', src: 'phb' },
    { v: 'rogue', label: 'Rogue', hd: 'd8', ab: 'DEX', role: 'Martial', src: 'phb' },
    { v: 'sorcerer', label: 'Sorcerer', hd: 'd6', ab: 'CHA', role: 'Caster', src: 'phb' },
    { v: 'warlock', label: 'Warlock', hd: 'd8', ab: 'CHA', role: 'Caster', src: 'phb' },
    { v: 'wizard', label: 'Wizard', hd: 'd6', ab: 'INT', role: 'Caster', src: 'phb' }
  ];

  var MODULES = [
    { id: 'phb', abbr: 'PHB', name: 'PHB 2024', species: ['Aasimar', 'Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Goliath', 'Halfling', 'Human', 'Orc', 'Tiefling'], classes: {
      barbarian: ['Path of the Berserker', 'Wild Heart', 'World Tree', 'Zealot'],
      bard: ['College of Dance', 'Glamour', 'Lore', 'Valor'],
      cleric: ['Life', 'Light', 'Trickery', 'War'],
      druid: ['Circle of the Land', 'Moon', 'Sea', 'Stars'],
      fighter: ['Battle Master', 'Champion', 'Eldritch Knight', 'Psi Warrior'],
      monk: ['Warrior of the Elements', 'Mercy', 'Open Hand', 'Shadow'],
      paladin: ['Oath of Devotion', 'Glory', 'the Ancients', 'Vengeance'],
      ranger: ['Beast Master', 'Fey Wanderer', 'Gloom Stalker', 'Hunter'],
      rogue: ['Arcane Trickster', 'Assassin', 'Soulknife', 'Thief'],
      sorcerer: ['Aberrant Sorcery', 'Clockwork Sorcery', 'Draconic Sorcery', 'Wild Magic'],
      warlock: ['Archfey', 'Celestial', 'Fiend', 'Great Old One Patron'],
      wizard: ['Abjurer', 'Diviner', 'Evoker', 'Illusionist']
    } },
    { id: 'dmg', abbr: 'DMG', name: 'DMG 2024', classes: {
      cleric: ['Death Domain'],
      paladin: ['Oathbreaker']
    } },
    { id: 'exe', abbr: 'ExE', name: 'Exploring Eberron', species: ['Hobgoblin', 'Merfolk', 'Aasimar variant'], classes: {
      artificer: ['Forge Adept', 'Maverick'],
      bard: ['College of the Dirge Singer'],
      cleric: ['Mind Domain'],
      druid: ['Circle of the Forged'],
      monk: ['Way of the Living Weapon']
    } },
    { id: 'au', abbr: 'AU', name: 'Arcana Unleashed', classes: {
      cleric: ['Arcana Domain'],
      fighter: ['Arcane Archer'],
      monk: ['Warrior of the Mystic Arts'],
      warlock: ['Vestige Patron'],
      wizard: ['Conjurer', 'Enchanter', 'Necromancer', 'Transmuter']
    } },
    { id: 'efa', abbr: 'EFA', name: 'Eberron: Forge of the Artificer', species: ['Changeling', 'Kalashtar', 'Khoravar', 'Shifter', 'Warforged'], classes: {
      artificer: ['Alchemist', 'Armorer', 'Artillerist', 'Battle Smith', 'Cartographer']
    } },
    { id: 'feq', abbr: 'FEQ', name: 'Frontiers of Eberron: Quickstone', classes: {
      barbarian: ['Path of the Demonshard'],
      bard: ['College of Wands'],
      cleric: ['Commerce Domain'],
      ranger: ['Bloodhound'],
      sorcerer: ['Nemesis Sorcery'],
      warlock: ['Stone Sovereign Patron']
    } },
    { id: 'rhw', abbr: 'RHW', name: 'Ravenloft: The Horrors Within', species: ['Dhampir', 'Hexblood', 'Lupin', 'Reborn'], classes: {
      artificer: ['Reanimator'],
      bard: ['College of Spirits'],
      cleric: ['Grave Domain'],
      ranger: ['Hollow Warden'],
      rogue: ['Phantom'],
      sorcerer: ['Shadow Sorcery'],
      warlock: ['Undead Patron']
    } },
    { id: 'tcm', abbr: 'TCM', name: 'The Crooked Moon', species: ['Ashborn', 'Azureborn', 'Bogborn', 'Curseborn', 'Deepborn', 'Gnarlborn', 'Graveborn', 'Harvestborn', 'Plagueborn', 'Relicborn', 'Silkborn', 'Stoneborn', 'Threadborn'], classes: {
      barbarian: ['Path of the Experiment'],
      bard: ['College of Whistles'],
      cleric: ['Harvest Domain'],
      druid: ['Circle of the Old Ways', 'Circle of Wicker'],
      fighter: ['Barrow Guard'],
      monk: ['Warrior of the Pestilent Haze'],
      paladin: ['Oath of Castigation'],
      ranger: ['Grim Harbinger'],
      rogue: ['Sinner'],
      sorcerer: ['Crimson Sorcery'],
      warlock: ['Great Fool Patron', 'Horned King Patron'],
      wizard: ['Occultist', 'Philosopher']
    } },
    { id: 'gh', abbr: 'GH', name: 'Grim Hollow', classes: {
      barbarian: ['Fractured', 'Primal Spirit', 'Wrathful Dead'],
      bard: ['Adventurers', 'Fools', 'Requiems'],
      cleric: ['Eldritch', 'Inquisition', 'Purification'],
      druid: ['Blood', 'Entropy', 'Mutation'],
      fighter: ['Bulwark Warrior', 'Living Crucible', 'Nightwatcher'],
      'monster-hunter': ['Carver', 'Devourer', 'Occultist', 'Trapper'],
      paladin: ['Pestilence', 'Slaughter', 'Zeal'],
      ranger: ['Green Reaper', 'Primordial Archer', 'Vermin Lord'],
      rogue: ['Highway Rider', 'Misfortune Bringer', 'Sanguine Thief'],
      sorcerer: ['Apocalypse', 'Haunted', 'Wretched'],
      warlock: ['Coven', 'First Vampire', 'Parasite'],
      wizard: ['Daemonologist', 'Plague Doctor', 'Sangromancer']
    } }
  ];

  var DEFAULT_ACTIVE = ['phb', 'dmg', 'tcm'];

  function mod(id) { return MODULES.filter(function (m) { return m.id === id; })[0]; }

  // Classes available for the given module ids, each with tagged subclasses. 'Other' is always last.
  function build(active) {
    var ids = (Array.isArray(active) && active.length ? active : DEFAULT_ACTIVE).filter(mod);
    var out = [];
    BASE.forEach(function (b) {
      var subs = [], from = [];
      ids.forEach(function (id) {
        var m = mod(id), list = m.classes[b.v];
        if (!list) return;
        from.push(m.abbr);
        list.forEach(function (s) { subs.push({ v: s, label: s, src: m.abbr }); });
      });
      if (!subs.length) return;
      var own = ids.indexOf(b.src) >= 0 ? mod(b.src).abbr : from[0];
      out.push({ v: b.v, label: b.label, hd: b.hd, ab: b.ab, role: b.role, src: own, subs: subs });
    });
    out.push({ v: 'other', label: 'Other', hd: '\u2014', ab: '\u2014', role: 'Homebrew', src: '', subs: [] });
    return out;
  }

  function spKey(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
  // Species from the given module ids, tagged with their source. 'Other' (homebrew) is appended by the caller.
  function buildSpecies(active) {
    var ids = (Array.isArray(active) && active.length ? active : DEFAULT_ACTIVE).filter(mod);
    var out = [];
    ids.forEach(function (id) { var md = mod(id); (md.species || []).forEach(function (s) { out.push({ v: spKey(s), label: s, src: md.abbr }); }); });
    return out;
  }
  function allSpecies() {
    var out = [];
    MODULES.forEach(function (md) { (md.species || []).forEach(function (s) { out.push({ v: spKey(s), label: s, src: md.abbr }); }); });
    return out;
  }

  window.CrookedMoonClassModules = { BASE: BASE, MODULES: MODULES, DEFAULT_ACTIVE: DEFAULT_ACTIVE, build: build, buildSpecies: buildSpecies, allSpecies: allSpecies };
})();
