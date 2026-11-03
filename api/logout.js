'use strict';
const L = require('./_lib');

module.exports = L.route('POST', async (req, res) => {
  L.setSession(req, res, '', 0);
  L.send(res, 200, { ok: true });
});
