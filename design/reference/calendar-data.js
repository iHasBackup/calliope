(function () {
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function parse(s) { var p = s.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function addDays(s, n) { var d = parse(s); d.setUTCDate(d.getUTCDate() + n); return ymd(d); }
  function dow(s) { return parse(s).getUTCDay(); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function tzOffset(label) {
    var m = /(?:GMT|UTC)\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?/i.exec(label || '');
    if (!m) return -new Date().getTimezoneOffset() / 60;
    var h = +m[2] + (+(m[3] || 0)) / 60;
    return m[1] === '-' ? -h : h;
  }
  function startMs(date, hour, tz) { return parse(date).getTime() + hour * 3600000 - tzOffset(tz) * 3600000; }

  var TONES = {
    accent: { bg: 'var(--color-accent)', fg: '#ffffff', border: 'var(--color-accent)', dot: 'var(--color-accent)' },
    ash: { bg: 'var(--color-accent-900)', fg: 'var(--color-accent-100)', border: 'var(--color-accent-400)', dot: 'var(--color-accent-400)' },
    stone: { bg: 'color-mix(in srgb, var(--color-bg) 24%, var(--color-text))', fg: 'var(--color-bg)', border: 'color-mix(in srgb, var(--color-bg) 45%, transparent)', dot: 'color-mix(in srgb, var(--color-bg) 60%, var(--color-text))' }
  };

  // Placeholder campaigns until real ones are added. Edit or remove freely.
  var OTHERS = [
    {
      id: 'drowned-bell', placeholder: true, title: 'The Drowned Bell', system: 'D&D 5e', tone: 'stone',
      start: '2026-03-07', end: '2026-05-30', weekday: 6, hour: 14, duration: 4, every: 1, tz: 'GMT+7',
      homeUrl: '', registerUrl: '', openSeats: 0,
      party: ['Mira · Cleric', 'Tobin · Fighter', 'Sel · Warlock', 'Fen · Ranger'],
      recaps: [
        { date: '2026-03-07', title: 'The Bell Under the Bay', body: 'A fishing village hears a church bell ringing from beneath the water every high tide.' },
        { date: '2026-05-30', title: 'Low Tide', body: 'The bell was raised and silenced. The campaign closed with the village rebuilding its pier.' }
      ],
      changes: [{ type: 'cancel', date: '2026-04-11', note: 'Holiday weekend.' }]
    },
    {
      id: 'ashen-pilgrims', placeholder: true, title: 'Ashen Pilgrims', system: 'Grim Hollow', tone: 'ash',
      start: '2026-11-14', end: '', weekday: 6, hour: 19, duration: 4, every: 2, tz: 'GMT+7',
      homeUrl: '', registerUrl: '', openSeats: 3,
      party: [], recaps: [], changes: []
    }
  ];

  function campaigns() {
    var list = [];
    var CM = window.CrookedMoonContent;
    if (CM) {
      var c = CM.load(), sc = c.schedule || {}, reg = c.registration || {};
      list.push({
        id: 'tcm', title: 'The Crooked Moon', system: c.system || '', tone: 'accent',
        start: sc.start || '2026-08-05', end: sc.end || '', weekday: sc.weekday, hour: sc.hour,
        duration: sc.duration || 4, every: 1, tz: sc.timezone || '',
        homeUrl: 'Campaign Home v2.dc.html', registerUrl: reg.open ? 'Registration.dc.html' : '',
        openSeats: reg.open && c.showOpenSeat !== false ? (reg.seats || 0) : 0,
        party: (c.party || []).map(function (p) { return p.name + ' · ' + p.klass; }),
        recaps: c.recaps || [], changes: sc.changes || []
      });
    }
    var t = today();
    return list.concat(OTHERS).map(function (c) {
      c.status = c.start > t ? 'upcoming' : (c.end && c.end < t ? 'finished' : 'running');
      return c;
    });
  }

  function sessions(c) {
    var out = [], ch = c.changes || [], byDate = {}, rec = {};
    ch.forEach(function (x) { if (x.type !== 'extra' && x.date) byDate[x.date] = x; });
    (c.recaps || []).forEach(function (r) { if (r.date) rec[r.date] = r; });
    var hourOf = function (x) { return x.toHour !== undefined && x.toHour !== '' && x.toHour !== null ? +x.toHour : c.hour; };
    var d = c.start;
    while (dow(d) !== c.weekday) d = addDays(d, 1);
    var stop = c.end || addDays(today(), 400);
    while (d <= stop) {
      var x = byDate[d], s = { campId: c.id, orig: d, date: d, hour: c.hour, duration: c.duration };
      if (x && x.type === 'cancel') { s.cancelled = true; s.note = x.note || ''; }
      else if (x && x.type === 'move') { s.date = x.toDate || d; s.hour = hourOf(x); s.movedFrom = d; s.note = x.note || ''; }
      out.push(s);
      d = addDays(d, 7 * (c.every || 1));
    }
    ch.forEach(function (x) {
      if (x.type === 'extra' && x.date) out.push({ campId: c.id, orig: x.date, date: x.date, hour: hourOf(x), duration: c.duration, extra: true, note: x.note || '' });
    });
    out.sort(function (a, b) { return a.date === b.date ? a.hour - b.hour : (a.date < b.date ? -1 : 1); });
    var n = 0;
    out.forEach(function (s, i) {
      if (!s.cancelled) s.n = ++n;
      s.recap = s.cancelled ? null : (rec[s.date] || rec[s.orig] || null);
      s.title = s.cancelled ? 'No session' : (s.recap ? s.recap.title : 'Session ' + s.n);
      s.startMs = startMs(s.date, s.hour, c.tz);
      s.endMs = s.startMs + s.duration * 3600000;
      s.id = c.id + ':' + s.orig + (s.extra ? ':x' + i : '');
    });
    return out;
  }

  function icsDate(ms) { return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function esc(t) { return String(t).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); }
  function icsEvent(c, s) {
    return ['BEGIN:VEVENT', 'UID:' + s.id + '@chocobie.site', 'DTSTAMP:' + icsDate(Date.now()),
      'DTSTART:' + icsDate(s.startMs), 'DTEND:' + icsDate(s.endMs),
      'SUMMARY:' + esc(c.title + (s.n ? ' · Session ' + s.n : '') + (s.recap ? ' · ' + s.recap.title : '')),
      'URL:https://www.chocobie.site/calendar', 'END:VEVENT'].join('\r\n');
  }
  function ics(c, list) {
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Chocobie//Calendar//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:' + esc(c.title)]
      .concat(list.map(function (s) { return icsEvent(c, s); })).concat(['END:VCALENDAR']).join('\r\n');
  }
  function download(name, text) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/calendar' }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  }

  window.ChocobieCalendar = { TONES: TONES, campaigns: campaigns, sessions: sessions, ics: ics, download: download, addDays: addDays, parse: parse, dow: dow, today: today, pad: pad };
})();
