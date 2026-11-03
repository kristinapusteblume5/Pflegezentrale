'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const COLLECTIONS = ['tasks', 'contacts', 'appts', 'tpls', 'drafts', 'homes', 'units', 'trip', 'prop'];
// Sammlungen mit genau einem Eintrag (feste ID)
const SINGLE = { trip: 'trip', prop: 'prop' };
const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;
const MAX_JSON = 100 * 1024;

class HttpError extends Error {
  constructor(status, message, extra) { super(message); this.status = status; this.extra = extra; }
}

function getConfig() {
  const e = process.env;
  const code = e.FAMILY_CODE || '';
  const secret = e.SESSION_SECRET || '';
  const url = e.DATABASE_URL || e.POSTGRES_URL || '';
  const problems = [];
  if (code.length < 10) problems.push('FAMILY_CODE fehlt oder ist kuerzer als 10 Zeichen');
  if (secret.length < 32) problems.push('SESSION_SECRET fehlt oder ist kuerzer als 32 Zeichen');
  if (!url) problems.push('DATABASE_URL fehlt');
  if (problems.length) { const err = new Error(problems.join('; ')); err.config = true; throw err; }
  return {
    code, secret, url,
    people: (e.PEOPLE || 'Kristina,Stefan').split(',').map((s) => s.trim()).filter(Boolean),
    careName: e.CARE_NAME || 'Papa',
    sessionDays: Number(e.SESSION_DAYS || 30),
    maxFails: Number(e.LOGIN_MAX_FAILS || 10),
    windowMin: Number(e.LOGIN_WINDOW_MINUTES || 15),
  };
}

function pool(cfg) {
  const g = globalThis;
  g.__pzPools = g.__pzPools || new Map();
  if (!g.__pzPools.has(cfg.url)) g.__pzPools.set(cfg.url, new Pool({ connectionString: cfg.url, max: 1, idleTimeoutMillis: 10000 }));
  return g.__pzPools.get(cfg.url);
}

async function ensureSchema(cfg) {
  const g = globalThis;
  g.__pzSchema = g.__pzSchema || new Map();
  if (!g.__pzSchema.has(cfg.url)) {
    const p = (async () => {
      const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
      const c = await pool(cfg).connect();
      try {
        await c.query('SELECT pg_advisory_lock(727274)');
        await c.query(sql);
        await c.query('SELECT pg_advisory_unlock(727274)');
      } finally { c.release(); }
    })();
    g.__pzSchema.set(cfg.url, p);
    p.catch(() => g.__pzSchema.delete(cfg.url));
  }
  return g.__pzSchema.get(cfg.url);
}

const sha256 = (v) => crypto.createHash('sha256').update(String(v)).digest();
const b64u = (s) => Buffer.from(s).toString('base64url');

function sign(payload, secret) {
  const p = b64u(JSON.stringify(payload));
  return p + '.' + crypto.createHmac('sha256', secret).update(p).digest('base64url');
}
function verify(token, secret) {
  if (typeof token !== 'string') return null;
  const [p, s] = token.split('.');
  if (!p || !s) return null;
  const expect = crypto.createHmac('sha256', secret).update(p).digest();
  let got; try { got = Buffer.from(s, 'base64url'); } catch (_) { return null; }
  if (got.length !== expect.length || !crypto.timingSafeEqual(got, expect)) return null;
  try {
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
    return payload && payload.exp > Date.now() ? payload : null;
  } catch (_) { return null; }
}
function cookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
const isHttps = (req) => String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
function setSession(req, res, value, maxAgeSec) {
  res.setHeader('Set-Cookie', `pz_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSec}${isHttps(req) ? '; Secure' : ''}`);
}
function requireAuth(req, cfg) {
  if (!verify(cookies(req).pz_session, cfg.secret)) throw new HttpError(401, 'Nicht angemeldet');
}
function requireCsrf(req) {
  if (req.method !== 'GET' && req.headers['x-requested-with'] !== 'pz') throw new HttpError(403, 'Ungueltige Anfrage');
}
function person(req, cfg) {
  const p = String(req.headers['x-person'] || '');
  return cfg.people.includes(p) ? p : null;
}
function requirePerson(req, cfg) {
  const p = person(req, cfg);
  if (!p) throw new HttpError(400, 'Bitte zuerst auswaehlen, wer du bist');
  return p;
}
function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
}
async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch (_) { throw new HttpError(400, 'Ungueltiges JSON'); } }
    if (Buffer.isBuffer(req.body)) { try { return JSON.parse(req.body.toString('utf8')); } catch (_) { throw new HttpError(400, 'Ungueltiges JSON'); } }
    return req.body;
  }
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > MAX_JSON * 2) throw new HttpError(413, 'Zu gross'); chunks.push(c); }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch (_) { throw new HttpError(400, 'Ungueltiges JSON'); }
}
function send(res, status, obj, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(obj));
}
function route(method, fn) {
  return async (req, res) => {
    try {
      if (req.method !== method && !(Array.isArray(method) && method.includes(req.method))) throw new HttpError(405, 'Methode nicht erlaubt');
      requireCsrf(req);
      const cfg = getConfig();
      await fn(req, res, cfg);
    } catch (e) {
      if (e instanceof HttpError) return send(res, e.status, { error: e.message, ...(e.extra || {}) });
      console.error(e);
      if (e.config) return send(res, 500, { error: 'Server nicht fertig eingerichtet' });
      return send(res, 500, { error: 'Interner Fehler' });
    }
  };
}
function validateData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new HttpError(400, 'Daten muessen ein Objekt sein');
  const json = JSON.stringify(data);
  if (json.length > MAX_JSON) throw new HttpError(413, 'Eintrag zu gross');
  const walk = (v, depth) => {
    if (depth > 6) throw new HttpError(400, 'Zu tief verschachtelt');
    if (typeof v === 'string' && v.length > 8000) throw new HttpError(400, 'Text zu lang');
    if (Array.isArray(v)) { if (v.length > 2000) throw new HttpError(400, 'Liste zu lang'); v.forEach((x) => walk(x, depth + 1)); }
    else if (v && typeof v === 'object') Object.values(v).forEach((x) => walk(x, depth + 1));
  };
  walk(data, 0);
}
async function logActivity(db, actor, summary, collection, entityId) {
  await db.query('INSERT INTO activity (actor, summary, collection, entity_id) VALUES ($1,$2,$3,$4)', [actor, String(summary).slice(0, 300), collection || null, entityId || null]);
}
function feedToken(cfg) { return crypto.createHmac('sha256', cfg.secret).update('ics-feed-v1').digest('base64url'); }
function feedOk(token, cfg) {
  const a = Buffer.from(String(token)); const b = Buffer.from(feedToken(cfg));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
module.exports = { SINGLE, feedToken, feedOk, COLLECTIONS, ID_RE, HttpError, getConfig, pool, ensureSchema, sha256, sign, verify, cookies, setSession, requireAuth, person, requirePerson, clientIp, readBody, send, route, validateData, logActivity };
