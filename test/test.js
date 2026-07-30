'use strict';

const assert = require('assert');
const { validateBSB, formatBSB, decodeBSB, lookupBSB } = require('../src/index.js');

let passed = 0;
function ok(name, cond) {
  assert.ok(cond, name);
  passed++;
  console.log('  ok -', name);
}

console.log('formatBSB');
ok('formats 6 digits', formatBSB('062000') === '062-000');
ok('strips a dash', formatBSB('062-000') === '062-000');
ok('strips spaces', formatBSB(' 062 000 ') === '062-000');
ok('accepts a number', formatBSB(62000) === null); // 62000 is only 5 digits -> null
ok('accepts 6-digit number', formatBSB(123456) === '123-456');
ok('rejects too short', formatBSB('123') === null);
ok('rejects too long', formatBSB('1234567') === null);
ok('rejects null', formatBSB(null) === null);

console.log('validateBSB');
ok('valid for good input', validateBSB('062-000').valid === true);
ok('formatted field set', validateBSB('062000').formatted === '062-000');
ok('invalid for bad input', validateBSB('12').valid === false);
ok('gives a reason', typeof validateBSB('12').reason === 'string');

console.log('decodeBSB');
const d = decodeBSB('062-000');
ok('decodes bank code', d.bankCode === '06');
ok('decodes state code', d.stateCode === '2');
ok('decodes branch code', d.branchCode === '000');
ok('null on bad input', decodeBSB('nope') === null);

console.log('lookupBSB (offline error paths)');
(async () => {
  try {
    await lookupBSB('12');
    throw new Error('should have thrown');
  } catch (e) {
    ok('throws on invalid BSB', /Invalid BSB/.test(e.message));
  }

  // stub fetch to avoid a real network call in CI
  const fakeFetch = async () => ({ ok: true, status: 200, json: async () => ({ bsb: '062-000', bank: 'CBA' }) });
  const result = await lookupBSB('062-000', { fetch: fakeFetch });
  ok('lookup returns data with injected fetch', result.bank === 'CBA');

  const notFound = async () => ({ ok: false, status: 404, statusText: 'Not Found', json: async () => ({}) });
  try {
    await lookupBSB('999-999', { fetch: notFound });
    throw new Error('should have thrown');
  } catch (e) {
    ok('throws on 404', /not found/i.test(e.message));
  }

  console.log(`\nAll ${passed} tests passed.`);
})();
