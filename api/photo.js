'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./_lib');

module.exports = L.route('GET', async (req, res, cfg) => {
  L.requireAuth(req, cfg);
  let buf;
  try { buf = fs.readFileSync(path.join(__dirname, '..', 'private', 'dieter.jpg')); }
  catch (_) { throw new L.HttpError(404, 'Kein Foto hinterlegt'); }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.end(buf);
});
