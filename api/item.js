'use strict';
const L = require('./_lib');

module.exports = L.route(['PUT', 'DELETE'], async (req, res, cfg) => {
  L.requireAuth(req, cfg);
  const who = L.requirePerson(req, cfg);
  await L.ensureSchema(cfg);
  const db = L.pool(cfg);
  const url = new URL(req.url, 'http://x');

  if (req.method === 'DELETE') {
    const collection = url.searchParams.get('collection') || '';
    const id = url.searchParams.get('id') || '';
    if (!L.COLLECTIONS.includes(collection) || !L.ID_RE.test(id)) throw new L.HttpError(400, 'Ungueltige Angaben');
    await db.query('BEGIN');
    try {
      const r = await db.query(`UPDATE items SET deleted_at = now(), rev = nextval('rev_seq'), updated_at = now(), updated_by = $3 WHERE collection = $1 AND id = $2 AND deleted_at IS NULL RETURNING rev::text`, [collection, id, who]);
      if (!r.rowCount) { await db.query('ROLLBACK'); throw new L.HttpError(404, 'Nicht gefunden'); }
      await L.logActivity(db, who, `Eintrag gelöscht (${collection})`, collection, id);
      await db.query('COMMIT');
      return L.send(res, 200, { ok: true });
    } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; }
  }

  const body = await L.readBody(req);
  const { collection, id, data, baseRev } = body || {};
  if (!L.COLLECTIONS.includes(collection) || typeof id !== 'string' || !L.ID_RE.test(id)) throw new L.HttpError(400, 'Ungueltige Angaben');
  if (L.SINGLE[collection] && id !== L.SINGLE[collection]) throw new L.HttpError(400, 'Ungueltige Angaben');
  L.validateData(data);
  const stored = { ...data, id };
  await db.query('BEGIN');
  try {
    const cur = await db.query('SELECT rev::text AS rev, deleted_at FROM items WHERE collection = $1 AND id = $2 FOR UPDATE', [collection, id]);
    const row = cur.rows[0];
    const live = row && !row.deleted_at;
    if (live && (baseRev === null || baseRev === undefined || String(baseRev) !== row.rev)) throw new L.HttpError(409, 'Wurde zwischenzeitlich geändert');
    if (!live && baseRev !== null && baseRev !== undefined) throw new L.HttpError(409, 'Wurde zwischenzeitlich gelöscht');
    const r = await db.query(
      `INSERT INTO items (collection, id, data, rev, created_by, updated_by) VALUES ($1,$2,$3,nextval('rev_seq'),$4,$4)
       ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data, rev = nextval('rev_seq'), updated_at = now(), updated_by = $4, deleted_at = NULL
       RETURNING rev::text`, [collection, id, JSON.stringify(stored), who]);
    await db.query('COMMIT');
    L.send(res, 200, { ok: true, rev: r.rows[0].rev });
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; }
});
