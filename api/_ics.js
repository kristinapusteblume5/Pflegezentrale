'use strict';
// Erzeugt iCalendar-Dateien (.ics), die der Apple-Kalender (und andere) lesen.
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const ymd = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
const utc = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

function fold(line) {
  const out = []; let cur = ''; let bytes = 0;
  for (const ch of line) {
    const b = Buffer.byteLength(ch);
    if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0; }
    cur += ch; bytes += b;
  }
  out.push(cur);
  return out.map((l, i) => (i ? ' ' + l : l)).join('\r\n');
}

function addU(s, n, u) {
  const x = new Date(s);
  if (u === 'w') { x.setDate(x.getDate() + 7 * n); return x; }
  const m = u === 'y' ? 12 * n : n; const dd = x.getDate();
  x.setDate(1); x.setMonth(x.getMonth() + m);
  x.setDate(Math.min(dd, new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate()));
  return x;
}
/** Einzeltermine: das eigene Datum. Serien: der nächste Termin ab "from". */
function nextOcc(a, from) {
  const s = new Date(a.date + 'T00:00:00');
  if (!a.rep) return s;
  let k = 0; let c = s;
  while (c < from && k < 600) { k++; c = addU(s, a.rep.n * k, a.rep.u); }
  return c;
}

function event(a, byId, objs, meta, now) {
  const from = new Date(now); from.setHours(0, 0, 0, 0);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date || '')) return null;
  const o = nextOcc(a, from);
  const doc = byId.get(a.arzt);
  const tgt = a.link && objs[a.link.k] ? objs[a.link.k].get(a.link.id) : null;
  const who = doc ? doc.n : (tgt ? tgt.n : '');
  const L = ['BEGIN:VEVENT', `UID:${a.id}@pflegezentrale`, `DTSTAMP:${utc(now)}`];
  if (meta && meta.updated) L.push(`LAST-MODIFIED:${utc(new Date(meta.updated))}`);
  if (meta && meta.rev) L.push(`SEQUENCE:${Number(meta.rev) % 1000000}`);
  L.push(`SUMMARY:${esc(`${a.what || 'Termin'}${who ? ` (${who})` : ''}`)}`);
  if (tgt && tgt.adr) L.push(`LOCATION:${esc(tgt.adr)}`);
  if (/^\d{2}:\d{2}$/.test(a.time || '')) { L.push(`DTSTART:${ymd(o)}T${a.time.replace(':', '')}00`, 'DURATION:PT1H'); }
  else L.push(`DTSTART;VALUE=DATE:${ymd(o)}`);
  if (a.rep && Number.isInteger(a.rep.n) && a.rep.n >= 1 && { w: 1, m: 1, y: 1 }[a.rep.u]) {
    L.push(`RRULE:FREQ=${{ w: 'WEEKLY', m: 'MONTHLY', y: 'YEARLY' }[a.rep.u]};INTERVAL=${a.rep.n}`);
  }
  const desc = [];
  if (a.note) desc.push(a.note);
  const ART = { wohnen: 'Besichtigung Demenzwohnen', immo: 'Immobilie' };
  if (ART[a.art]) desc.push(ART[a.art]);
  if (tgt) desc.push(`${tgt.n}${tgt.adr ? ' · ' + tgt.adr : ''}`);
  const hin = a.hin === 'offen' ? 'Begleitung: noch nicht geklärt'
    : a.hin === 'pflege' ? 'Begleitung: Pflegedienst bringt hin'
    : a.hin === 'ok' ? 'Begleitung: ist organisiert'
    : a.hin === 'kein' ? 'Begleitung: wird nicht gebraucht'
    : a.hin === 'selbst' ? 'Geht selbst hin'
    : a.hin === 'andere' ? 'Begleitung: jemand anderes bringt hin'
    : /^p:/.test(a.hin || '') ? `Begleitung: ${a.hin.slice(2)} organisiert` : '';
  if (hin) desc.push(hin);
  if (doc) desc.push(`${doc.n}${doc.r ? ' · ' + doc.r : ''}${doc.t ? ' · Tel. ' + doc.t : ''}`);
  if (desc.length) L.push(`DESCRIPTION:${esc(desc.join('\n'))}`);
  if (a.rem > 0) L.push('BEGIN:VALARM', `TRIGGER:-P${Math.floor(a.rem)}D`, 'ACTION:DISPLAY', 'DESCRIPTION:Erinnerung', 'END:VALARM');
  L.push('END:VEVENT');
  return L;
}

/** appts: [{data, rev, updated}], contacts: [{id, data}] */
function calendar(appts, contacts, now = new Date(), name = 'Pflegezentrale Termine', extra = {}) {
  const byId = new Map(contacts.map((c) => [c.id, c.data]));
  const objs = { home: new Map((extra.homes || []).map((h) => [h.id, h.data])), unit: new Map((extra.units || []).map((u) => [u.id, u.data])) };
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Pflegezentrale//DE', 'CALSCALE:GREGORIAN', `X-WR-CALNAME:${esc(name)}`];
  for (const x of appts) { const ev = event({ ...x.data, id: x.id }, byId, objs, { rev: x.rev, updated: x.updated }, now); if (ev) lines.push(...ev); }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}
module.exports = { calendar, nextOcc, fold, esc };
