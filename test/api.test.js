'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { boot, client, shutdown, CODE, setEnv } = require('./helpers');

let ctx;
before(async () => { ctx = await boot(); });
after(async () => { await shutdown(ctx); });

test('Server ohne Konfiguration meldet "nicht fertig eingerichtet" statt Details', async () => {
  const saved = process.env.FAMILY_CODE; process.env.FAMILY_CODE = 'kurz';
  const r = await client(ctx.base).api('POST', '/api/login', { code: 'kurz' });
  process.env.FAMILY_CODE = saved;
  assert.equal(r.status, 500);
  assert.match(r.json.error, /nicht fertig eingerichtet/);
  assert.doesNotMatch(JSON.stringify(r.json), /FAMILY_CODE|SESSION_SECRET/);
});

test('geschützte Endpunkte verlangen Anmeldung', async () => {
  const c = client(ctx.base, 'Kristina');
  for (const [m, u, b] of [['GET', '/api/state'], ['PUT', '/api/item', { collection: 'tasks', id: 'a', data: {} }], ['DELETE', '/api/item?collection=tasks&id=a'], ['POST', '/api/log', { entries: ['x'] }], ['GET', '/api/photo']]) {
    const r = await c.api(m, u, b);
    assert.equal(r.status, 401, `${m} ${u}`);
  }
});

test('Login: falscher Code abgelehnt, richtiger setzt sicheres Cookie', async () => {
  const c = client(ctx.base);
  assert.equal((await c.login('falscher-code-xyz')).status, 401);
  const ok = await c.login();
  assert.equal(ok.status, 200);
  assert.match(ok.setCookie, /HttpOnly/);
  assert.match(ok.setCookie, /SameSite=Strict/);
  assert.doesNotMatch(ok.setCookie, /Secure/, 'lokal über http ohne Secure');
  const https = await client(ctx.base).api('POST', '/api/login', { code: CODE }, { 'x-forwarded-proto': 'https' });
  assert.match(https.setCookie, /Secure/, 'hinter https mit Secure');
});

test('Anfragen ohne X-Requested-With werden abgelehnt (CSRF-Schutz)', async () => {
  const r = await fetch(ctx.base + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: CODE }) });
  assert.equal(r.status, 403);
});

test('manipulierte oder abgelaufene Sitzung wird abgelehnt', async () => {
  const c = client(ctx.base, 'Kristina'); await c.login();
  const good = c.cookie;
  c.cookie = good.slice(0, -3) + 'abc';
  assert.equal((await c.api('GET', '/api/state')).status, 401);
  const { sign } = require('../api/_lib');
  c.cookie = 'pz_session=' + sign({ exp: Date.now() - 1000, v: 1 }, 'x'.repeat(40));
  assert.equal((await c.api('GET', '/api/state')).status, 401);
  c.cookie = 'pz_session=' + sign({ exp: Date.now() + 100000, v: 1 }, 'andere-geheimnis-andere-geheimnis-12');
  assert.equal((await c.api('GET', '/api/state')).status, 401, 'mit falschem Schlüssel signiert');
  c.cookie = good;
  assert.equal((await c.api('GET', '/api/state')).status, 200);
});

test('Fehlversuche werden begrenzt und der richtige Code wird dann nicht angenommen', async () => {
  setEnv();
  const c = client(ctx.base);
  const hdr = { 'x-forwarded-for': '203.0.113.9' };
  for (let i = 0; i < 5; i++) assert.equal((await c.api('POST', '/api/login', { code: 'nope-nope-nope-1' }, hdr)).status, 401);
  assert.equal((await c.api('POST', '/api/login', { code: CODE }, hdr)).status, 429);
  // andere Adresse bleibt unberührt
  assert.equal((await c.api('POST', '/api/login', { code: CODE }, { 'x-forwarded-for': '203.0.113.10' })).status, 200);
  const raw = await ctx.direct.query('SELECT ip_hash FROM login_attempts');
  assert.ok(raw.rows.every((r) => !r.ip_hash.includes('203.0.113')), 'IP wird nur als Hash gespeichert');
});

test('State: Vorlagen werden einmalig angelegt, Konfiguration kommt erst nach Login', async () => {
  const c = client(ctx.base, 'Kristina'); await c.login();
  const s = (await c.api('GET', '/api/state')).json;
  assert.deepEqual(s.config.people, ['Kristina', 'Stefan']);
  assert.equal(s.config.careName, 'Dieter');
  assert.match(s.config.feed, /^\/api\/ics\?feed=/);
  assert.equal(s.items.tpls.length, 3);
  assert.equal(s.items.tpls[0].data.n, 'Pflegedienst');
  assert.equal(s.items.tpls[0].data.to, '', 'keine erfundenen Empfänger');
  const again = (await c.api('GET', '/api/state')).json;
  assert.equal(again.items.tpls.length, 3, 'nicht doppelt angelegt');
  const unchanged = (await c.api('GET', '/api/state?rev=' + encodeURIComponent(s.rev))).json;
  assert.equal(unchanged.unchanged, true);
});

test('Anlegen, Lesen, Ändern mit Versionsprüfung, Löschen', async () => {
  const a = client(ctx.base, 'Kristina'); await a.login();
  const b = client(ctx.base, 'Stefan'); await b.login();
  const put = await a.api('PUT', '/api/item', { collection: 'tasks', id: 't-1', data: { t: 'Test', st: 0 }, baseRev: null });
  assert.equal(put.status, 200);
  const s1 = (await b.api('GET', '/api/state')).json;
  const item = s1.items.tasks.find((x) => x.id === 't-1');
  assert.equal(item.data.t, 'Test');
  // doppelte Neuanlage
  assert.equal((await b.api('PUT', '/api/item', { collection: 'tasks', id: 't-1', data: { t: 'Doppelt' }, baseRev: null })).status, 409);
  // Stefan ändert mit aktueller Version
  const up = await b.api('PUT', '/api/item', { collection: 'tasks', id: 't-1', data: { t: 'Test 2', st: 1 }, baseRev: item.rev });
  assert.equal(up.status, 200);
  // Kristina ändert mit veralteter Version -> Konflikt
  const stale = await a.api('PUT', '/api/item', { collection: 'tasks', id: 't-1', data: { t: 'Überschrieben' }, baseRev: put.json.rev });
  assert.equal(stale.status, 409);
  const cur = (await a.api('GET', '/api/state')).json.items.tasks.find((x) => x.id === 't-1');
  assert.equal(cur.data.t, 'Test 2');
  const who = await ctx.direct.query("SELECT created_by, updated_by FROM items WHERE id='t-1'");
  assert.deepEqual(who.rows[0], { created_by: 'Kristina', updated_by: 'Stefan' });
  // Löschen: unsichtbar, Datensatz bleibt erhalten, Änderung wird erkannt
  const before = (await a.api('GET', '/api/state')).json.rev;
  assert.equal((await a.api('DELETE', '/api/item?collection=tasks&id=t-1')).status, 200);
  const after = (await a.api('GET', '/api/state?rev=' + encodeURIComponent(before))).json;
  assert.notEqual(after.unchanged, true, 'Löschung ändert den Stand');
  assert.ok(!after.items.tasks.some((x) => x.id === 't-1'));
  const kept = await ctx.direct.query("SELECT deleted_at FROM items WHERE id='t-1'");
  assert.ok(kept.rows[0].deleted_at, 'Soft-Delete');
  assert.equal((await a.api('DELETE', '/api/item?collection=tasks&id=t-1')).status, 404);
  // Veraltete Änderung an gelöschtem Eintrag -> Konflikt
  assert.equal((await b.api('PUT', '/api/item', { collection: 'tasks', id: 't-1', data: { t: 'Zombie' }, baseRev: up.json.rev })).status, 409);
});

test('Eingaben werden geprüft: Sammlung, ID, Größe, Person', async () => {
  const c = client(ctx.base, 'Kristina'); await c.login();
  const put = (body) => c.api('PUT', '/api/item', body);
  assert.equal((await put({ collection: 'users', id: 'a', data: {} })).status, 400);
  assert.equal((await put({ collection: 'dx', id: 'a', data: {} })).status, 400, 'keine Diagnosen-Sammlung');
  assert.equal((await put({ collection: 'meds', id: 'a', data: {} })).status, 400, 'keine Medikamenten-Sammlung');
  assert.equal((await put({ collection: 'tasks', id: "a'; DROP TABLE items;--", data: {} })).status, 400);
  assert.equal((await put({ collection: 'tasks', id: 'a', data: 'text' })).status, 400);
  assert.equal((await put({ collection: 'tasks', id: 'a', data: [1] })).status, 400);
  assert.equal((await put({ collection: 'tasks', id: 'a', data: { t: 'x'.repeat(9000) } })).status, 400);
  assert.equal((await put({ collection: 'tasks', id: 'a', data: { blob: 'y'.repeat(7000).repeat(20).split('').slice(0, 0).join('') || 'ok', arr: Array(2500).fill(1) } })).status, 400);
  assert.equal((await put({ collection: 'trip', id: 'anders', data: {} })).status, 400);
  const nobody = client(ctx.base); nobody.cookie = c.cookie;
  assert.equal((await nobody.api('PUT', '/api/item', { collection: 'tasks', id: 'p', data: { t: 'x' }, baseRev: null })).status, 400, 'ohne Person');
  const fake = client(ctx.base, 'Mallory'); fake.cookie = c.cookie;
  assert.equal((await fake.api('PUT', '/api/item', { collection: 'tasks', id: 'p', data: { t: 'x' }, baseRev: null })).status, 400, 'unbekannte Person');
  const t = await ctx.direct.query("SELECT to_regclass('public.items') AS t");
  assert.ok(t.rows[0].t, 'Tabelle noch vorhanden');
});

test('Aktivitätsprotokoll: Einträge mit Person, nicht änderbar, Löschung wird automatisch protokolliert', async () => {
  const c = client(ctx.base, 'Stefan'); await c.login();
  assert.equal((await c.api('POST', '/api/log', { entries: ['Aufgabe angelegt: Test', 5, ''] })).status, 200);
  const s = (await c.api('GET', '/api/state')).json;
  assert.ok(s.activity.some((a) => a.actor === 'Stefan' && a.summary === 'Aufgabe angelegt: Test'));
  assert.ok(s.activity.some((a) => /gelöscht/.test(a.summary)), 'automatischer Löscheintrag');
  await assert.rejects(ctx.direct.query("UPDATE activity SET summary='x'"), /append-only/);
  await assert.rejects(ctx.direct.query('DELETE FROM activity'), /append-only/);
  await assert.rejects(ctx.direct.query('TRUNCATE activity'), /append-only/);
});

test('Foto nur nach Anmeldung; ohne Datei sauberes 404', async () => {
  const c = client(ctx.base, 'Kristina'); await c.login();
  const f = path.join(__dirname, '..', 'private', 'dieter.jpg');
  const had = fs.existsSync(f);
  const bak = had ? fs.readFileSync(f) : null;
  if (had) fs.unlinkSync(f);
  assert.equal((await c.api('GET', '/api/photo')).status, 404);
  fs.writeFileSync(f, Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
  const r = await c.api('GET', '/api/photo');
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-type'), 'image/jpeg');
  assert.match(r.headers.get('cache-control'), /private/);
  if (bak) fs.writeFileSync(f, bak); else fs.unlinkSync(f);
});

test('Logout beendet die Sitzung im Browser', async () => {
  const c = client(ctx.base, 'Kristina'); await c.login();
  const r = await c.api('POST', '/api/logout', {});
  assert.match(r.setCookie, /Max-Age=0/);
  assert.equal((await c.api('GET', '/api/state')).status, 401);
});

test('Die öffentliche Seite enthält keine Daten und kein Foto', async () => {
  const r = await fetch(ctx.base + '/');
  const t = r.status === 200 ? await r.text() : '';
  assert.doesNotMatch(t, /data:image\/jpeg;base64/);
  assert.doesNotMatch(t, /Dieter|Kristina|Stefan/);
});
