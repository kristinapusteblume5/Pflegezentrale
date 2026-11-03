'use strict';
const { Pool } = require('pg');
const { start } = require('../dev/server');

const DB = process.env.TEST_DATABASE_URL || 'postgres://pflege:pflege_dev@localhost:5432/pflege_v1_test';
const CODE = 'test-familiencode-123';

function setEnv(over = {}) {
  Object.assign(process.env, {
    DATABASE_URL: DB, FAMILY_CODE: CODE, SESSION_SECRET: 'x'.repeat(40),
    PEOPLE: 'Kristina,Stefan', CARE_NAME: 'Dieter', LOGIN_MAX_FAILS: '5', LOGIN_WINDOW_MINUTES: '15',
  }, over);
}

async function resetDb() {
  const p = new Pool({ connectionString: DB });
  await p.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await p.end();
  globalThis.__pzSchema = undefined;
  if (globalThis.__pzPools) { for (const pl of globalThis.__pzPools.values()) await pl.end(); globalThis.__pzPools = undefined; }
}

async function boot() {
  setEnv();
  await resetDb();
  const server = await start(0);
  const base = `http://localhost:${server.address().port}`;
  return { server, base, direct: new Pool({ connectionString: DB }) };
}

/** Kleiner HTTP-Client mit Cookie-Speicher */
function client(base, person) {
  let cookie = '';
  const api = async (method, url, body, extra = {}) => {
    const headers = { 'X-Requested-With': 'pz', ...(person ? { 'X-Person': person } : {}), ...extra };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (cookie) headers.cookie = cookie;
    const r = await fetch(base + url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const sc = r.headers.get('set-cookie');
    if (sc) cookie = sc.split(';')[0].endsWith('=') ? '' : sc.split(';')[0];
    let json = null; const ct = r.headers.get('content-type') || '';
    if (ct.includes('json')) { try { json = await r.json(); } catch (_) {} } else { json = Buffer.from(await r.arrayBuffer()); }
    return { status: r.status, json, headers: r.headers, setCookie: sc };
  };
  return { api, login: (code = CODE) => api('POST', '/api/login', { code }), get cookie() { return cookie; }, set cookie(v) { cookie = v; } };
}

async function shutdown(ctx) {
  await new Promise((r) => ctx.server.close(r));
  await ctx.direct.end();
  if (globalThis.__pzPools) for (const pl of globalThis.__pzPools.values()) await pl.end();
}
module.exports = { boot, client, shutdown, CODE, setEnv, DB };
