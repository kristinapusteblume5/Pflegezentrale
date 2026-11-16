'use strict';
const L = require('./_lib');
const ICS = require('./_ics');

// Ein Termin:   /api/ics?id=<Termin>   (nur mit Anmeldung)
// Alle Termine: /api/ics?feed=<Token>  (zum Abonnieren im Kalender; Token steht nach der Anmeldung in den Einstellungen)
module.exports = L.route('GET', async (req, res, cfg) => {
  const url = new URL(req.url, 'http://x');
  const feed = url.searchParams.get('feed');
  const id = url.searchParams.get('id');
  if (feed !== null) { if (!L.feedOk(feed, cfg)) throw new L.HttpError(401, 'Ungültiger Link'); }
  else { L.requireAuth(req, cfg); if (!id || !L.ID_RE.test(id)) throw new L.HttpError(400, 'Ungültige Angaben'); }
  await L.ensureSchema(cfg);
  const db = L.pool(cfg);
  const q = id && feed === null
    ? await db.query(`SELECT id, data, rev::text AS rev, updated_at AS updated FROM items WHERE collection='appts' AND id=$1 AND deleted_at IS NULL`, [id])
    : await db.query(`SELECT id, data, rev::text AS rev, updated_at AS updated FROM items WHERE collection='appts' AND deleted_at IS NULL ORDER BY created_at`);
  if (id && feed === null && !q.rowCount) throw new L.HttpError(404, 'Nicht gefunden');
  const contacts = await db.query(`SELECT id, data FROM items WHERE collection='contacts' AND deleted_at IS NULL`);
  const homes = await db.query(`SELECT id, data FROM items WHERE collection='homes' AND deleted_at IS NULL`);
  const units = await db.query(`SELECT id, data FROM items WHERE collection='units' AND deleted_at IS NULL`);
  const body = ICS.calendar(q.rows, contacts.rows, new Date(), feed !== null ? 'Pflegezentrale Termine' : 'Termin', { homes: homes.rows, units: units.rows });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `inline; filename="${feed !== null ? 'termine' : 'termin'}.ics"`);
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
});
