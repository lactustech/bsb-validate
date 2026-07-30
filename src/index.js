/**
 * bsb-validate
 * Validate, format, and look up Australian BSB (Bank State Branch) numbers.
 *
 * Offline validation works with no network calls.
 * Full lookups are powered by the free BSBFinder API: https://bsbfinder.com
 *
 * @license MIT
 */

'use strict';

const API_BASE = 'https://bsbfinder.com/api';

/**
 * Normalise a BSB into canonical NNN-NNN form.
 * Accepts "062000", "062-000", " 062 000 ", etc.
 * Returns null if the input can't be reduced to 6 digits.
 *
 * @param {string|number} input
 * @returns {string|null}
 */
function formatBSB(input) {
  if (input === null || input === undefined) return null;
  const digits = String(input).replace(/\D/g, '');
  if (digits.length !== 6) return null;
  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
}

/**
 * Validate a BSB's format offline (no network call).
 *
 * A structurally valid Australian BSB is six digits. The first two digits
 * identify the bank/institution; the third identifies the state; the final
 * three identify the branch. This checks structure only, not whether the
 * BSB is currently active in the AusPayNet register — use lookupBSB() for that.
 *
 * @param {string|number} input
 * @returns {{ valid: boolean, formatted: string|null, reason?: string }}
 */
function validateBSB(input) {
  const formatted = formatBSB(input);
  if (!formatted) {
    return { valid: false, formatted: null, reason: 'BSB must contain exactly 6 digits' };
  }
  return { valid: true, formatted };
}

/**
 * Decode the structural parts of a BSB (offline).
 *
 * @param {string|number} input
 * @returns {{ formatted: string, bankCode: string, stateCode: string, branchCode: string }|null}
 */
function decodeBSB(input) {
  const formatted = formatBSB(input);
  if (!formatted) return null;
  const digits = formatted.replace('-', '');
  return {
    formatted,
    bankCode: digits.slice(0, 2),   // institution
    stateCode: digits.slice(2, 3),  // state/territory
    branchCode: digits.slice(3),    // branch
  };
}

/**
 * Look up full BSB details via the free BSBFinder API.
 * Returns bank name, branch, address and payment capabilities.
 *
 * Requires a fetch implementation. Node 18+ and modern browsers have a
 * global fetch. For older Node, pass one in via options.fetch.
 *
 * @param {string|number} input
 * @param {{ fetch?: Function, signal?: AbortSignal }} [options]
 * @returns {Promise<object>} resolved BSB record
 * @throws if the BSB is invalid, not found, or the request fails
 */
async function lookupBSB(input, options = {}) {
  const formatted = formatBSB(input);
  if (!formatted) {
    throw new Error(`Invalid BSB: "${input}" (must be 6 digits)`);
  }

  const fetchImpl = options.fetch || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchImpl) {
    throw new Error(
      'No fetch implementation available. Use Node 18+, a browser, or pass options.fetch.'
    );
  }

  const url = `${API_BASE}/bsb/${encodeURIComponent(formatted)}`;
  const res = await fetchImpl(url, { signal: options.signal });

  if (res.status === 404) {
    throw new Error(`BSB ${formatted} was not found in the register.`);
  }
  if (!res.ok) {
    throw new Error(`BSBFinder API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

module.exports = { validateBSB, formatBSB, decodeBSB, lookupBSB, API_BASE };
