'use strict';
const L = require('./_lib');

const DEFAULT_TEMPLATES = [
  { id: 't1', n: 'Pflegedienst', on: true, to: '', sub: 'Abwesenheit vom {von} bis {bis}', body: 'Guten Tag,\n\nunser Angehöriger ist vom {von} bis {bis} ({tage} Tage) nicht zu Hause.\nGrund: {grund}\nBitte setzen Sie die vereinbarten Einsätze in diesem Zeitraum aus und bestätigen Sie uns das kurz.\n\nVielen Dank und freundliche Grüße' },
  { id: 't2', n: 'Apotheke', on: true, to: '', sub: 'Anfrage Bedarf für {tage} Tage', body: 'Guten Tag,\n\nfür den Zeitraum {von} bis {bis} möchten wir prüfen, ob die Versorgung ausreicht. Bitte teilen Sie uns mit, welche Packungen nötig sind.\n\nFreundliche Grüße' },
  { id: 't3', n: 'Hausverwaltung', on: false, to: '', sub: 'Abwesenheit {von} bis {bis}', body: 'Guten Tag,\n\nzur Information: Wir sind vom {von} bis {bis} abwesend.\n{grund}\n\nFreundliche Grüße' },
];

module.exports = L.route('GET', async (req, res, cfg) => {
  L.requireAuth(req, cfg);
  await L.ensureSchema(cfg);
  const db = L.pool(cfg);
  const seeded = await db.query("SELECT 1 FROM meta WHERE key = 'seeded'");
  if (!seeded.rowCount) {
    await db.query('BEGIN');
    try {
      for (const t of DEFAULT_TEMPLATES) {
        await db.query(`INSERT INTO items (collection, id, data, rev, created_by, updated_by) VALUES ('tpls', $1, $2, nextval('rev_seq'), 'System', 'System') ON CONFLICT DO NOTHING`, [t.id, JSON.stringify(t)]);
      }
      await db.query("INSERT INTO meta (key, value) VALUES ('seeded', '1') ON CONFLICT DO NOTHING");
      await db.query('COMMIT');
    } catch (e) { await db.query('ROLLBACK'); throw e; }
  }
  const st = await db.query(`SELECT COALESCE((SELECT max(rev) FROM items), 0)::text AS rev, COALESCE((SELECT max(id) FROM activity), 0)::text AS act`);
  const stamp = `${st.rows[0].rev}:${st.rows[0].act}`;
  const url = new URL(req.url, 'http://x');
  if (url.searchParams.get('rev') === stamp) return L.send(res, 200, { unchanged: true, rev: stamp });
  const items = await db.query(`SELECT collection, id, data, rev::text AS rev, created_at FROM items WHERE deleted_at IS NULL ORDER BY created_at ASC, id ASC`);
  const out = {};
  for (const c of L.COLLECTIONS) out[c] = [];
  for (const r of items.rows) if (out[r.collection]) out[r.collection].push({ id: r.id, data: r.data, rev: r.rev, created: r.created_at });
  const act = await db.query(`SELECT at, actor, summary FROM activity ORDER BY id DESC LIMIT 60`);
  L.send(res, 200, { rev: stamp, config: { people: cfg.people, careName: cfg.careName, feed: '/api/ics?feed=' + L.feedToken(cfg) }, items: out, activity: act.rows });
});
