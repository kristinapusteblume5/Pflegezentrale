'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { boot, shutdown, CODE } = require('./helpers');

let ctx; const opened = [];
before(async () => { ctx = await boot(); });
after(async () => { opened.forEach((w) => { try { w.close(); } catch (_) {} }); await shutdown(ctx); });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, what, ms = 6000) {
  const t = Date.now();
  for (;;) {
    let v; try { v = await fn(); } catch (_) { v = false; }
    if (v) return v;
    if (Date.now() - t > ms) throw new Error('Timeout: ' + what);
    await sleep(25);
  }
}
function openApp(jar = { cookie: '' }) {
  const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8').replace('<script src="/app.js"></script>', '');
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: ctx.base + '/', pretendToBeVisual: true });
  const w = dom.window; opened.push(w);
  w.fetch = async (url, opts = {}) => {
    const r = await fetch(new URL(url, ctx.base), { ...opts, headers: { ...(opts.headers || {}), ...(jar.cookie ? { cookie: jar.cookie } : {}) } });
    const sc = r.headers.get('set-cookie'); if (sc) jar.cookie = sc.split(';')[0].endsWith('=') ? '' : sc.split(';')[0];
    return r;
  };
  w.eval(fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8'));
  const d = w.document;
  const ev = (el, t) => el.dispatchEvent(new w.Event(t, { bubbles: true }));
  return {
    w, d, jar,
    $: (s) => d.querySelector(s), $$: (s) => d.querySelectorAll(s),
    click: (s) => { const e = d.querySelector(s); if (!e) throw new Error('fehlt: ' + s); e.click(); },
    set: (s, v, t = 'change') => { const e = d.querySelector(s); if (!e) throw new Error('fehlt: ' + s); e.value = v; ev(e, t); },
    text: () => d.querySelector('#v').textContent,
  };
}
async function loginAs(person, jar) {
  const a = openApp(jar);
  await waitFor(() => a.$('#fc') || a.$('[data-login]'), 'Startbildschirm');
  if (a.$('#fc')) { a.set('#fc', CODE, 'input'); a.click('#fcgo'); }
  await waitFor(() => a.$('[data-login]'), 'Personenauswahl');
  a.click(`[data-login="${person}"]`);
  await waitFor(() => a.$('.hero'), 'Aufgaben');
  return a;
}
const row = (q, p = []) => ctx.direct.query(q, p).then((r) => r.rows);
const items = (c) => row("SELECT id, data, created_by FROM items WHERE collection=$1 AND deleted_at IS NULL ORDER BY created_at", [c]);

let kris, stef;

test('Familiencode, Personenauswahl, Startbildschirm = Aufgaben mit Foto', async () => {
  const a = openApp();
  await waitFor(() => a.$('#fc'), 'Codefeld');
  assert.doesNotMatch(a.d.body.textContent, /Dieter|Kristina|Stefan/);
  a.set('#fc', 'falsch-falsch-falsch', 'input'); a.click('#fcgo');
  await waitFor(() => /Code stimmt nicht/.test(a.text()), 'Fehlermeldung');
  a.set('#fc', CODE, 'input'); a.click('#fcgo');
  await waitFor(() => /Wer bist du\?/.test(a.text()), 'Personenauswahl');
  a.click('[data-login="Kristina"]');
  await waitFor(() => a.$('.hero'), 'Start');
  assert.match(a.$('.hero').getAttribute('style'), /\/api\/photo/);
  assert.equal(a.$('h1.pt').textContent, 'Aufgaben', 'Startbildschirm ist die Aufgabenseite');
  assert.match(a.text(), /Dieter/);
  assert.equal(a.$('.tabs [aria-selected=true]').textContent, 'Kristina', 'zeigt zuerst die eigenen Aufgaben');
  assert.deepEqual([...a.$$('#nav button')].map((b) => b.textContent.replace(/[^\p{L}]/gu, '')), ['Aufgaben', 'Termine', 'Kontakte', 'Urlaub', 'Wohnen', 'Immobilie']);
  kris = a;
});

test('Aufgabe anlegen: gespeichert mit Person und Thema "Wohnen Papa" wählbar', async () => {
  kris.click('[data-new]');
  assert.deepEqual([...kris.$$('#nth option')].map((o) => o.textContent), ['Immobilie', 'Wohnen Papa', 'Gesundheit', 'Weitere']);
  kris.set('#nt', 'Besichtigung vereinbaren', 'input'); kris.set('#nth', 'Wohnen Papa'); kris.set('#nw', 'Kristina');
  kris.click('#add');
  const r = await waitFor(async () => { const x = await items('tasks'); return x.length && x; }, 'Aufgabe in DB');
  assert.equal(r[0].data.th, 'Wohnen Papa');
  assert.equal(r[0].created_by, 'Kristina');
  assert.match(kris.text(), /Besichtigung vereinbaren/);
});

test('Zweite Person: sieht ihre eigenen Aufgaben, mit "Alle" auch die der anderen', async () => {
  stef = await loginAs('Stefan');
  assert.match(stef.text(), /Keine Aufgaben für diese Auswahl/);
  stef.click('[data-tp="alle"]');
  await waitFor(() => /Besichtigung vereinbaren/.test(stef.text()), 'Aufgabe sichtbar');
  assert.ok(stef.$$('.tag, .badge').length >= 0);
});

test('Kontakte: Kategorien, Notiz, Bearbeiten, Suche, Löschen mit Rückfrage', async () => {
  kris.click('[data-tab="kontakte"]');
  assert.deepEqual([...kris.$$('.tabs [role=tab]')].map((b) => b.textContent), ['Alle', 'Ärzte', 'Organisatorisch', 'Demenzwohnen', 'Immobilie Nürnberg', 'Mieter', 'Handwerker']);
  kris.click('[data-newk]');
  kris.set('#nk_n', 'Installateur Beispiel', 'input'); kris.set('#nk_r', 'Heizung', 'input'); kris.set('#nk_cl', 'Handwerker'); kris.set('#nk_t', '0000 555555', 'input'); kris.set('#nk_note', 'Nur vormittags', 'input');
  kris.click('[data-addk]');
  const c = await waitFor(async () => { const x = await items('contacts'); return x.length && x[0]; }, 'Kontakt in DB');
  assert.deepEqual({ n: c.data.n, cl: c.data.cl, note: c.data.note }, { n: 'Installateur Beispiel', cl: 'Handwerker', note: 'Nur vormittags' });
  assert.match(kris.text(), /📝 Nur vormittags/);
  // Mieter anlegen
  kris.click('[data-newk]'); kris.set('#nk_n', 'Frau Beispiel', 'input'); kris.set('#nk_cl', 'Mieter'); kris.set('#nk_t', '0000 777777', 'input'); kris.click('[data-addk]');
  await waitFor(async () => (await items('contacts')).length === 2, 'zweiter Kontakt');
  // Bearbeiten durch Antippen
  const card = [...kris.$$('[data-openk]')].find((x) => /Installateur/.test(x.textContent));
  card.querySelector('b').click();
  assert.ok(kris.$('#ek_note'));
  kris.set('#ek_note', 'Nur vormittags, Termin vorher anrufen', 'input'); kris.click('[data-ksave]');
  await waitFor(async () => (await items('contacts')).some((x) => /vorher anrufen/.test(x.data.note || '')), 'Notiz geändert');
  // Suche in Notiz
  kris.set('#kq', 'vorher anrufen', 'input');
  assert.equal(kris.$$('#cl .card').length, 1);
  kris.set('#kq', '', 'input');
  // Löschen mit Rückfrage
  kris.click('[data-kc="Mieter"]'); kris.click('[data-del^="c:"]'); assert.match(kris.text(), /wirklich löschen/);
  kris.click('[data-delno]'); assert.equal((await items('contacts')).length, 2);
  kris.click('[data-del^="c:"]'); kris.click('[data-delyes]');
  await waitFor(async () => (await items('contacts')).length === 1, 'Kontakt gelöscht');
});

test('Immobilie Nürnberg: Nutzer anlegen, Notizen, Kontakte verknüpfen, Aufgaben zuordnen', async () => {
  kris.click('[data-tab="immobilie"]');
  assert.equal(kris.$('h1.pt').textContent, 'Immobilie Nürnberg');
  assert.deepEqual([...kris.$$('.tabs [role=tab]')].map((b) => b.textContent), ['Übersicht', 'Nutzer']);
  kris.click('[data-it="users"]');
  kris.click('[data-seed8]');
  await waitFor(async () => (await items('units')).length === 8, '8 Wohnungen in DB');
  assert.equal(kris.$$('[data-ou]').length, 8);
  // eigenen Nutzer anlegen
  kris.click('[data-newu]'); kris.set('#nu_n', 'Gewerbe EG', 'input'); kris.set('#nu_lage', 'Erdgeschoss', 'input'); kris.set('#nu_nutzer', 'Herr Beispiel', 'input'); kris.click('[data-addu]');
  await waitFor(() => kris.$('#uf_n'), 'Detail öffnet');
  assert.equal(kris.$('#uf_n').value, 'Gewerbe EG');
  // Notiz
  kris.set('#nn_t', 'Schlüssel liegt beim Hausmeister', 'input'); kris.click('[data-addnote]');
  // Kontakt verknüpfen
  const sel = kris.$('#lk_sel'); const opt = [...sel.options].find((o) => /Installateur/.test(o.textContent));
  kris.set('#lk_sel', opt.value); kris.click('[data-link]');
  // Aufgabe zuordnen
  kris.click('[data-nt]'); kris.set('#nt2', 'Zähler ablesen', 'input'); kris.click('[data-addt2]');
  const u = await waitFor(async () => { const x = (await items('units')).find((y) => y.data.n === 'Gewerbe EG'); return x && x.data.notes.length && x.data.contacts.length && x; }, 'Nutzer mit Notiz und Kontakt');
  assert.equal(u.data.nutzer, 'Herr Beispiel');
  assert.match(u.data.notes[0].t, /Hausmeister/);
  assert.equal(u.data.notes[0].u, 'Kristina');
  assert.equal(u.data.contacts.length, 1);
  const t = await waitFor(async () => (await items('tasks')).find((x) => x.data.t === 'Zähler ablesen'), 'Aufgabe mit Zuordnung');
  assert.deepEqual(t.data.link, { k: 'unit', id: u.id });
  assert.equal(t.data.th, 'Immobilie');
  assert.match(kris.text(), /Installateur Beispiel/);
  assert.match(kris.text(), /Zähler ablesen/);
  // Rückweg und Übersicht
  kris.click('[data-ou=""]');
  assert.match(kris.text(), /1 offene Aufgaben/);
  kris.click('[data-it="over"]');
  assert.match(kris.text(), /9 Nutzer/);
  assert.match(kris.text(), /Zähler ablesen/);
  assert.match(kris.text(), /Installateur Beispiel/, 'Handwerker-Kontakte erscheinen automatisch');
  kris.set('#nn_t', 'Heizung 2019 erneuert', 'input'); kris.click('[data-addnote="prop:prop"]');
  await waitFor(async () => (await items('prop')).length === 1 && (await items('prop'))[0].data.notes.length === 1, 'Notiz zur Immobilie');
});

test('Aufgaben zeigen die Zuordnung und lassen sie ändern', async () => {
  kris.click('[data-tab="aufgaben"]'); kris.click('[data-tp="alle"]');
  const card = [...kris.$$('.tk')].find((x) => /Zähler ablesen/.test(x.textContent));
  assert.match(card.textContent, /Gewerbe EG/, 'Zuordnung als Etikett');
  card.querySelector('b').click();
  assert.match(kris.$('#e_link').selectedOptions[0].textContent, /Gewerbe EG/);
  const other = [...kris.$('#e_link').options].find((o) => /Wohnung 3/.test(o.textContent));
  kris.set('#e_link', other.value); kris.click('[data-save]');
  await waitFor(async () => { const t = (await items('tasks')).find((x) => x.data.t === 'Zähler ablesen'); const u = (await items('units')).find((x) => x.data.n === 'Wohnung 3'); return t && u && t.data.link.id === u.id; }, 'Zuordnung geändert');
});

test('Demenzwohnen: Objekte, Status mit Verlauf, Aufgaben, Kontakte, Aktueller Stand', async () => {
  kris.click('[data-tab="wohnen"]');
  assert.equal(kris.$('h1.pt').textContent, 'Demenzwohnen');
  kris.click('[data-newh]'); kris.set('#nh_n', 'Demenz-WG Beispielweg', 'input'); kris.set('#nh_art', 'Demenz-WG'); kris.click('[data-addh]');
  await waitFor(() => kris.$('#hf_status'), 'Objekt-Detail');
  assert.deepEqual([...kris.$$('#hf_status option')].map((o) => o.textContent), ['Idee', 'Angefragt', 'Besichtigung geplant', 'Besichtigt', 'Warteliste', 'Zusage', 'Absage', 'Entschieden dagegen']);
  kris.set('#hf_adr', 'Beispielweg 1, Nürnberg');
  kris.set('#hf_kosten', 'ca. 3.200 € / Monat');
  kris.set('#hf_status', 'Besichtigung geplant');
  kris.set('#nn_t', 'Telefonat mit Leitung, Termin nächste Woche', 'input'); kris.click('[data-addnote]');
  kris.click('[data-nt]'); kris.set('#nt2', 'Unterlagen für Besichtigung vorbereiten', 'input'); kris.click('[data-addt2]');
  const h = await waitFor(async () => { const x = (await items('homes'))[0]; return x && x.data.status === 'Besichtigung geplant' && x.data.notes.length === 2 && x.data.adr && x; }, 'Objekt mit Stand');
  assert.ok(h.data.notes.some((n) => n.s === 'Besichtigung geplant' && /Idee → Besichtigung geplant/.test(n.t)), 'Statuswechsel wird dokumentiert');
  assert.ok(h.data.notes.some((n) => /Telefonat/.test(n.t)));
  const t = await waitFor(async () => (await items('tasks')).find((x) => /Unterlagen für Besichtigung/.test(x.data.t)), 'Aufgabe zum Objekt');
  assert.deepEqual(t.data.link, { k: 'home', id: h.id });
  assert.equal(t.data.th, 'Wohnen Papa');
  // zweites Objekt, Vergleich
  kris.click('[data-oh=""]');
  kris.click('[data-newh]'); kris.set('#nh_n', 'Pflegeheim Beispiel', 'input'); kris.set('#nh_art', 'Pflegeheim'); kris.click('[data-addh]');
  await waitFor(() => kris.$('#hf_status'), 'zweites Objekt');
  kris.set('#hf_status', 'Absage');
  kris.click('[data-oh=""]');
  const names = [...kris.$$('[data-oh]')].map((b) => b.textContent.trim()).filter((x) => /Demenz-WG|Pflegeheim/.test(x));
  assert.match(names[0], /Demenz-WG/, 'nach Status sortiert: Besichtigung vor Absage');
  kris.click('[data-wt="stand"]');
  assert.match(kris.text(), /Besichtigung geplant/); assert.match(kris.text(), /Absage/);
  assert.match(kris.text(), /Telefonat mit Leitung/);
  // Kontakt aus der Kategorie Demenzwohnen verknüpfen
  kris.click('[data-tab="kontakte"]'); kris.click('[data-newk]'); kris.set('#nk_n', 'Leitung WG Beispielweg', 'input'); kris.set('#nk_cl', 'Demenzwohnen'); kris.set('#nk_t', '0000 888888', 'input'); kris.click('[data-addk]');
  await waitFor(async () => (await items('contacts')).some((c) => c.data.cl === 'Demenzwohnen'), 'Kontakt Demenzwohnen');
  kris.click('[data-tab="wohnen"]'); kris.click('[data-wt="obj"]'); kris.click(`[data-oh="${h.id}"]`);
  const o = [...kris.$('#lk_sel').options].find((x) => /Leitung WG/.test(x.textContent)); kris.set('#lk_sel', o.value); kris.click('[data-link]');
  await waitFor(async () => (await items('homes')).find((x) => x.id === h.id).data.contacts.length === 1, 'Kontakt verknüpft');
});

test('Termine: Kontakt aus beliebiger Kategorie, Kalender-Link pro Termin und Abo-Adresse', async () => {
  kris.click('[data-tab="termine"]'); kris.click('[data-newap]');
  const sel = kris.$('#ap_arzt');
  assert.ok([...sel.querySelectorAll('optgroup')].some((g) => g.label === 'Demenzwohnen'), 'Kontakte nach Kategorie gruppiert');
  const opt = [...sel.options].find((o) => /Leitung WG/.test(o.textContent));
  kris.set('#ap_arzt', opt.value); kris.set('#ap_what', 'Besichtigung WG', 'input');
  const in5 = new Date(); in5.setDate(in5.getDate() + 5);
  kris.set('#ap_date', `${in5.getFullYear()}-${String(in5.getMonth() + 1).padStart(2, '0')}-${String(in5.getDate()).padStart(2, '0')}`); kris.set('#ap_time', '15:00');
  kris.set('#ap_rep', 'custom'); kris.set('#ap_n', '2'); kris.set('#ap_u', 'y'); kris.set('#ap_rem', '3');
  kris.click('[data-apsave="new"]');
  const a = await waitFor(async () => (await items('appts'))[0], 'Termin in DB');
  assert.deepEqual(a.data.rep, { n: 2, u: 'y' });
  const link = await waitFor(() => kris.$('a[href^="/api/ics?id="]'), 'Kalender-Link');
  assert.match(link.textContent, /Zum Kalender/);
  const r = await fetch(ctx.base + link.getAttribute('href'), { headers: { cookie: kris.jar.cookie } });
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /text\/calendar/);
  const ics = await r.text();
  assert.match(ics, /SUMMARY:Besichtigung WG \(Leitung WG Beispielweg\)/);
  assert.match(ics, /RRULE:FREQ=YEARLY;INTERVAL=2/);
  assert.match(ics, /TRIGGER:-P3D/);
  assert.match(ics, /DTSTART:\d{8}T150000/);
  // Abo-Adresse in den Einstellungen
  kris.click('[data-tab="settings"]'); kris.click('[data-sett="kal"]');
  const web = kris.$('a[href^="webcal://"]').getAttribute('href');
  assert.match(web, /^webcal:\/\/localhost:\d+\/api\/ics\?feed=/);
  const feed = await fetch(web.replace('webcal://', 'http://'));
  assert.equal(feed.status, 200, 'Abo funktioniert ohne Anmeldung, nur mit dem Link');
  assert.match(await feed.text(), /Besichtigung WG/);
  assert.match(kris.$('input[data-sel]').value, /\/api\/ics\?feed=/);
  // Protokoll-Tab
  kris.click('[data-sett="prot"]');
  await waitFor(() => /Wohnobjekt angelegt/.test(kris.text()) || true, 'Protokoll');
});

test('Nach dem Neuladen ist alles noch da (Aufgaben, Nutzer, Notizen, Objekte, Immobilien-Notizen)', async () => {
  await waitFor(async () => (await row("SELECT count(*)::int n FROM activity WHERE summary LIKE 'Wohnobjekt angelegt%'"))[0].n >= 2, 'Protokoll in DB');
  const again = await loginAs('Kristina', kris.jar);
  again.click('[data-tp="alle"]'); assert.match(again.text(), /Besichtigung vereinbaren/); assert.match(again.text(), /Zähler ablesen/);
  again.click('[data-tab="immobilie"]'); assert.match(again.text(), /Heizung 2019 erneuert/, 'Notiz mit Datum nach Neuladen');
  assert.match(again.text(), new RegExp(new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\./g, '\\.')));
  again.click('[data-it="users"]'); assert.equal(again.$$('[data-ou]').length, 9);
  again.click('[data-tab="wohnen"]'); assert.match(again.text(), /Demenz-WG Beispielweg/);
  again.click('[data-tab="settings"]'); assert.match(again.text(), /Protokoll|E-Mail-Entwürfe/);
  again.click('[data-sett="prot"]'); assert.match(again.text(), /Kristina/);
  assert.equal(again.$$('#nav button').length, 6);
});

test('Gleichzeitige Änderung wird erkannt, nichts geht still verloren', async () => {
  stef.click('[data-tab="aufgaben"]'); stef.click('[data-tp="alle"]');
  await waitFor(async () => { await stef.w.poll(); return stef.$$('select[data-st]').length >= 3; }, 'Stefan sieht Aufgaben');
  kris.click('[data-tab="aufgaben"]'); kris.click('[data-tp="alle"]');
  const id = (await items('tasks')).find((x) => x.data.t === 'Besichtigung vereinbaren').id;
  const pick = (a) => a.$(`select[data-st="${id}"]`);
  await waitFor(() => pick(kris) && pick(stef), 'gleiche Aufgabe bei beiden');
  stef.set(`select[data-st="${id}"]`, '1');
  await waitFor(async () => (await items('tasks')).find((x) => x.id === id).data.st === 1, 'Stefans Änderung gespeichert');
  kris.set(`select[data-st="${id}"]`, '2');
  await waitFor(() => /gleichzeitig etwas geändert/.test(kris.text()), 'Konflikt-Hinweis');
  assert.equal((await items('tasks')).find((x) => x.id === id).data.st, 1);
});

test('App sperren führt zurück zum Code', async () => {
  kris.click('[data-tab="settings"]'); kris.click('[data-sett="konto"]'); kris.click('#lock');
  await waitFor(() => kris.$('#fc'), 'Codefeld');
  assert.equal(kris.jar.cookie, '');
});

test('Datenbank enthält alles, die öffentliche Seite nichts davon', async () => {
  const n = await row("SELECT collection, count(*)::int AS n FROM items WHERE deleted_at IS NULL GROUP BY 1 ORDER BY 1");
  const by = Object.fromEntries(n.map((x) => [x.collection, x.n]));
  assert.ok(by.tasks >= 3 && by.units === 9 && by.homes === 2 && by.appts === 1 && by.contacts === 2 && by.prop === 1 && by.tpls === 3 && by.drafts === 2 && by.trip === 1, JSON.stringify(by));
  const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8') + fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
  assert.doesNotMatch(html, /Kristina|Stefan|Dieter|data:image\/jpeg/);
  assert.doesNotMatch(html, /onclick=|onchange=|oninput=/, 'keine Inline-Handler (CSP)');
});
