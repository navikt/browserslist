import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import { levels } from '../lib/levels.js';

const require = createRequire(import.meta.url);
const browsers = require('@navikt/browserslist-config/browsers.json');
const support = require('../data/support.json');

const FAMILIES = Object.keys(browsers);

/** Recomputed here (not read from belowFloor) so the verdict itself is cross-checked. */
function nativeAtFloor(featureKey) {
  const verdict = support.features[featureKey];
  if (!verdict) throw new Error(`Marker feature "${featureKey}" missing from data/support.json`);
  const result = FAMILIES.every(
    (family) =>
      verdict.native[family] !== null &&
      verdict.native[family] <= Number.parseFloat(browsers[family]),
  );
  assert.equal(verdict.belowFloor, !result, `${featureKey}: generated belowFloor disagrees with the recomputation`);
  return result;
}

describe(`es.year = ${levels.es.year} is guarded by marker features`, () => {
  it('ES2021 markers are natively available at the floor', () => {
    assert.equal(nativeAtFloor('logical-assignment'), true);
    assert.equal(nativeAtFloor('nullish-coalescing'), true);
    assert.equal(nativeAtFloor('optional-chaining'), true);
  });

  it('ES2022 is NOT complete at the floor (class static blocks need Safari 16.4)', () => {
    assert.equal(nativeAtFloor('static-blocks'), false);
  });

  it('so es.year must stay 2021 until the Safari floor reaches 16.4', () => {
    const safariFloor = Number.parseFloat(browsers.safari);
    if (safariFloor < 16.4) {
      assert.equal(levels.es.year, 2021);
    }
  });
});
