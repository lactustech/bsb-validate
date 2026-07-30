# bsb-validate

Validate, format, decode, and look up Australian **BSB (Bank State Branch)** numbers in Node.js and the browser.

- ✅ **Offline validation** — no network call needed to check format
- 🔎 **Full lookups** — bank, branch, address and payment capabilities via the free [BSBFinder API](https://bsbfinder.com)
- 🧩 **Zero dependencies**
- 📦 **TypeScript types included**

BSB numbers are the six-digit codes that route domestic bank transfers in Australia. This library helps you validate them before submitting a payment, decode their structure, and fetch full branch details on demand.

## Install

```bash
npm install bsb-validate
```

## Quick start

```js
const { validateBSB, formatBSB, decodeBSB, lookupBSB } = require('bsb-validate');

// Offline: validate format
validateBSB('062-000');
// → { valid: true, formatted: '062-000' }

validateBSB('62');
// → { valid: false, formatted: null, reason: 'BSB must contain exactly 6 digits' }

// Offline: normalise messy input
formatBSB(' 062 000 ');   // → '062-000'
formatBSB('062000');      // → '062-000'

// Offline: decode the structural parts
decodeBSB('062-000');
// → { formatted: '062-000', bankCode: '06', stateCode: '2', branchCode: '000' }

// Online: full details via the BSBFinder API
const details = await lookupBSB('062-000');
console.log(details.bank, details.branch, details.address);
```

## API

### `validateBSB(input)`

Checks whether a value is a structurally valid BSB (six digits). Works fully offline. Returns `{ valid, formatted, reason? }`.

Note: this validates *format*, not whether the BSB is currently active in the AusPayNet register. For that, use `lookupBSB()`.

### `formatBSB(input)`

Normalises any 6-digit input (`"062000"`, `"062-000"`, `" 062 000 "`, `123456`) to canonical `NNN-NNN` form. Returns `null` if it can't be reduced to six digits.

### `decodeBSB(input)`

Breaks a BSB into its parts: the first two digits (`bankCode`) identify the institution, the third (`stateCode`) the state/territory, and the last three (`branchCode`) the branch. Returns `null` on invalid input.

### `lookupBSB(input, options?)`

Fetches full details for a BSB from the free [BSBFinder API](https://bsbfinder.com) — bank name, branch, address, SWIFT code and payment methods (BECS/NPP). Returns a `Promise`.

Node 18+ and modern browsers have a global `fetch`. For older Node, pass one in:

```js
const fetch = require('node-fetch');
const details = await lookupBSB('062-000', { fetch });
```

Supports an `AbortSignal` via `options.signal`.

## Data source

Full lookups are powered by [**BSBFinder.com**](https://bsbfinder.com), a free tool that indexes every active Australian BSB code (sourced from AusPayNet). BSBFinder also offers:

- A free [BSB lookup API](https://bsbfinder.com/api)
- A [BSB validator](https://bsbfinder.com/validate) web tool
- [SWIFT/BIC code lookup](https://bsbfinder.com/swift) for Australian banks
- Bulk BSB lookup

The API is free to use for reasonable volumes and requires no authentication.

## License

MIT © Ujwal Jayendran

---

Built alongside [BSBFinder.com](https://bsbfinder.com) — free Australian bank code tools.
# bsb-validate
