'use strict';
const crypto = require('crypto');
const L = require('./_lib');

module.exports = L.route('POST', async (req, res, cfg) => {
  await L.ensureSchema(cfg);
  const db = L.pool(cfg);
  const body = await L.readBody(req);
  const code = typeof body.code === 'string' ? body.code : '';
  const ipHash = L.sha256(L.clientIp(req) + cfg.secret).toString('hex');
  await db.query("DELETE FROM login_attempts WHERE at < now() - interval '1 day'");
  const r = await db.query(`SELECT count(*)::int AS n FROM login_attempts WHERE ip_hash = $1 AND at > now() - ($2 || ' minutes')::interval`, [ipHash, String(cfg.windowMin)]);
  if (r.rows[0].n >= cfg.maxFails) throw new L.HttpError(429, 'Zu viele Versuche. Bitte spaeter erneut versuchen.', {});
  const ok = crypto.timingSafeEqual(L.sha256(code), L.sha256(cfg.code));
  if (!ok) {
    await db.query('INSERT INTO login_attempts (ip_hash) VALUES ($1)', [ipHash]);
    throw new L.HttpError(401, 'Der Code stimmt nicht');
  }
  await db.query('DELETE FROM login_attempts WHERE ip_hash = $1', [ipHash]);
  const maxAge = cfg.sessionDays * 86400;
  L.setSession(req, res, L.sign({ exp: Date.now() + maxAge * 1000, v: 1 }, cfg.secret), maxAge);
  L.send(res, 200, { ok: true });
});
