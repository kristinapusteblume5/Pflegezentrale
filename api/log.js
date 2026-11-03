'use strict';
const L = require('./_lib');

module.exports = L.route('POST', async (req, res, cfg) => {
  L.requireAuth(req, cfg);
  const who = L.requirePerson(req, cfg);
  await L.ensureSchema(cfg);
  const body = await L.readBody(req);
  const entries = Array.isArray(body.entries) ? body.entries.slice(0, 30) : [];
  const db = L.pool(cfg);
  for (const e of entries) if (typeof e === 'string' && e.trim()) await L.logActivity(db, who, e.trim());
  L.send(res, 200, { ok: true });
});
