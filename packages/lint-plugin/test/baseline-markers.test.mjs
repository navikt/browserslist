import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import { levels } from '../lib/levels.js';

const require = createRequire(import.meta.url);
const browsers = require('@navikt/browserslist-config/browsers.json');
const support = require('../data/support.json');

const FAMILIES = Object.keys(browsers);

function nativeAtFloor(featureKey) {
  const verdict = support.features[featureKey];
  if (!verdict) throw new Error(`Marker feature "${featureKey}" missing from data/support.json`);
  return FAMILIES.every(
    (family) =>
      verdict.native[family] !== null &&
      verdict.native[family] <= Number.parseFloat(browsers[family]),
  );
}

// The Baseline year is approximate by design (levels.baseline.approximate):
// Baseline's core browser set excludes Opera and Samsung Internet, which the
// floor includes. The markers below pin the approximation from both sides.
describe(`baseline.year ≈ ${levels.baseline.year} is guarded by marker features`, () => {
  it('is marked approximate', () => {
    assert.equal(levels.baseline.approximate, true);
  });

  it('Baseline 2022 markers are natively available at the floor', () => {
    assert.equal(nativeAtFloor('structured-clone'), true);
    assert.equal(nativeAtFloor('dialog-showmodal'), true);
    assert.equal(nativeAtFloor('array-at'), true);
  });

  it('a Baseline 2023 marker is NOT available (Array immutables need Chrome 110)', () => {
    assert.equal(nativeAtFloor('array-immutable'), false);
  });

  it('so baseline.year must stay 2022 until the Chrome floor reaches 110', () => {
    const chromeFloor = Number.parseFloat(browsers.chrome);
    if (chromeFloor < 110) {
      assert.equal(levels.baseline.year, 2022);
    }
  });
});
