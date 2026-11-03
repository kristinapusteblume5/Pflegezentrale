'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { calendar, nextOcc, fold, esc } = require('../api/_ics');
const { boot, client, shutdown } = require('./helpers');

const contacts = [{ id: 'k1', data: { n: 'Dr. Muster', r: 'Hausarzt', t: '0000 000000' } }];
const NOW = new Date(2026, 10, 2, 12, 0, 0); // 2. Nov 2026, lokal

test('ICS: Aufbau, Zeilenenden, Escaping, Erinnerung', () => {
  const ics = calendar([{ id: 'p1', rev: '42', updated: new Date(Date.UTC(2026, 10, 1)), data: { arzt: 'k1', what: 'Kontrolle; Blut, Urin', date: '2026-11-12', time: '09:30', rep: null, rem: 3, note: 'Zeile 1\nZeile 2' } }], contacts, NOW);
  assert.match(ics, /^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\n/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
  assert.match(ics, /UID:p1@pflegezentrale/);
  assert.match(ics, /SUMMARY:Kontrolle\\; Blut\\, Urin \(Dr\. Muster\)/);
  assert.match(ics, /DTSTART:20261112T093000\r\n/);
  assert.match(ics, /DURATION:PT1H/);
  assert.match(ics, /TRIGGER:-P3D/);
  assert.match(ics, /DESCRIPTION:Zeile 1\\nZeile 2\\nDr\. Muster · Hausarzt · Tel\. 0000 000000/);
  assert.match(ics, /SEQUENCE:42/);
  assert.doesNotMatch(ics, /RRULE/);
  assert.ok(!/[^\r]\n/.test(ics.replace(/\r\n/g, '')), 'nur CRLF');
});

test('ICS: Serien starten beim nächsten Termin und bekommen eine Wiederholungsregel', () => {
  const mk = (rep, date) => calendar([{ id: 'p2', rev: '1', updated: NOW, data: { arzt: 'k1', what: 'Check-up', date, time: '', rep, rem: 0, note: '' } }], contacts, NOW);
  const y = mk({ n: 1, u: 'y' }, '2025-12-15');
  assert.match(y, /DTSTART;VALUE=DATE:20261215/);
  assert.match(y, /RRULE:FREQ=YEARLY;INTERVAL=1/);
  assert.doesNotMatch(y, /VALARM/);
  assert.match(mk({ n: 8, u: 'w' }, '2026-10-01'), /RRULE:FREQ=WEEKLY;INTERVAL=8/);
  assert.match(mk({ n: 3, u: 'm' }, '2026-01-31'), /RRULE:FREQ=MONTHLY;INTERVAL=3/);
  assert.equal(nextOcc({ date: '2026-01-31', rep: { n: 1, u: 'm' } }, new Date(2026, 1, 1)).getDate(), 28, 'Monatsende wird begrenzt');
  assert.doesNotMatch(mk({ n: 0, u: 'x' }, '2026-10-01'), /RRULE/, 'ungültige Serie ohne Regel');
});

test('ICS: lange Zeilen werden nach 75 Bytes umgebrochen, Umlaute zerreißen nicht', () => {
  const long = 'Ä'.repeat(100);
  const f = fold('SUMMARY:' + long);
  for (const line of f.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75, line.length + '');
  assert.equal(f.replace(/\r\n /g, ''), 'SUMMARY:' + long);
  assert.equal(esc('a\\b'), 'a\\\\b');
});

test('ICS: Termin ohne Datum wird übersprungen', () => {
  const ics = calendar([{ id: 'x', rev: '1', updated: NOW, data: { what: 'Kaputt', date: 'morgen' } }], contacts, NOW);
  assert.doesNotMatch(ics, /VEVENT/);
});

let ctx;
before(async () => { ctx = await boot(); });
after(async () => { await shutdown(ctx); });

test('API: Einzeltermin nur mit Anmeldung, Feed nur mit richtigem Token', async () => {
  const c = client(ctx.base, 'Kristina');
  assert.equal((await c.api('GET', '/api/ics?id=a1')).status, 401);
  await c.login();
  await c.api('PUT', '/api/item', { collection: 'contacts', id: 'k1', data: { n: 'Dr. Muster', r: 'Hausarzt', cl: 'Ärzte', t: '0000 000000' }, baseRev: null });
  await c.api('PUT', '/api/item', { collection: 'appts', id: 'a1', data: { arzt: 'k1', what: 'Kontrolle', date: '2030-05-04', time: '08:15', rep: { n: 6, u: 'm' }, rem: 7, note: '' }, baseRev: null });
  await c.api('PUT', '/api/item', { collection: 'appts', id: 'a2', data: { arzt: 'k1', what: 'Blutabnahme', date: '2030-06-01', time: '', rep: null, rem: 0, note: '' }, baseRev: null });
  const one = await c.api('GET', '/api/ics?id=a1');
  assert.equal(one.status, 200);
  assert.match(one.headers.get('content-type'), /text\/calendar/);
  assert.match(one.headers.get('content-disposition'), /inline; filename="termin\.ics"/);
  const t = one.json.toString('utf8');
  assert.match(t, /SUMMARY:Kontrolle \(Dr\. Muster\)/);
  assert.match(t, /RRULE:FREQ=MONTHLY;INTERVAL=6/);
  assert.doesNotMatch(t, /Blutabnahme/, 'nur der gewählte Termin');
  assert.equal((await c.api('GET', '/api/ics?id=gibt-es-nicht')).status, 404);
  assert.equal((await c.api('GET', "/api/ics?id=x'y")).status, 400);

  const feedPath = (await c.api('GET', '/api/state')).json.config.feed;
  assert.match(feedPath, /^\/api\/ics\?feed=[A-Za-z0-9_-]{30,}$/);
  const anon = client(ctx.base); // ohne Cookie, wie ein Kalender-Abo
  const feed = await anon.api('GET', feedPath);
  assert.equal(feed.status, 200);
  const ft = feed.json.toString('utf8');
  assert.match(ft, /Kontrolle/); assert.match(ft, /Blutabnahme/);
  assert.match(ft, /X-WR-CALNAME:Pflegezentrale Termine/);
  assert.equal((await anon.api('GET', '/api/ics?feed=falsch')).status, 401);
  assert.equal((await anon.api('GET', feedPath.slice(0, -2) + 'xx')).status, 401);
  // gelöschte Termine verschwinden aus dem Abo
  await c.api('DELETE', '/api/item?collection=appts&id=a2');
  assert.doesNotMatch((await anon.api('GET', feedPath)).json.toString('utf8'), /Blutabnahme/);
});

test('API: neue Sammlungen (Wohnobjekte, Nutzer, Immobilie) funktionieren, Einzel-Sammlung nur mit fester ID', async () => {
  const c = client(ctx.base, 'Stefan'); await c.login();
  const put = (collection, id, data) => c.api('PUT', '/api/item', { collection, id, data, baseRev: null });
  assert.equal((await put('homes', 'h1', { n: 'Demenz-WG Beispiel', status: 'Idee', notes: [] })).status, 200);
  assert.equal((await put('units', 'u1', { n: 'Wohnung 1', notes: [], contacts: [] })).status, 200);
  assert.equal((await put('prop', 'prop', { id: 'prop', notes: [] })).status, 200);
  assert.equal((await put('prop', 'andere', { notes: [] })).status, 400);
  const s = (await c.api('GET', '/api/state')).json;
  assert.equal(s.items.homes[0].data.n, 'Demenz-WG Beispiel');
  assert.equal(s.items.units.length, 1);
  assert.equal(s.items.prop.length, 1);
});
