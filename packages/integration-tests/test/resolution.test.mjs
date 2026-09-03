import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import browserslist from 'browserslist';
import queries from '@navikt/browserslist-config';

const require = createRequire(import.meta.url);
const browsers = require('@navikt/browserslist-config/browsers.json');

const testsDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const fixtures = {
  'package.json': path.join(testsDir, 'fixtures', 'pkg-json-consumer'),
  '.browserslistrc': path.join(testsDir, 'fixtures', 'rc-consumer'),
};

/** family -> numeric lower bound of the oldest resolved version */
function minima(resolved) {
  const result = {};
  for (const entry of resolved) {
    const [family, version] = entry.split(' ');
    const bound = Number.parseFloat(version.split('-')[0]);
    if (!(family in result) || bound < result[family]) result[family] = bound;
  }
  return result;
}

for (const [kind, fixtureDir] of Object.entries(fixtures)) {
  describe(`extends via ${kind} fixture`, () => {
    const resolved = browserslist(undefined, { path: fixtureDir });

    it('resolves identically to the inline queries', () => {
      assert.deepEqual(resolved, browserslist(queries));
    });

    it('yields exactly the configured families, each bottoming out at its floor', () => {
      const mins = minima(resolved);
      assert.deepEqual(Object.keys(mins).sort(), Object.keys(browsers).sort());
      for (const [family, floor] of Object.entries(browsers)) {
        assert.equal(mins[family], Number.parseFloat(floor), `floor mismatch for ${family}`);
      }
    });

    it('includes nothing older than the floor', () => {
      for (const present of ['chrome 108', 'firefox 121', 'safari 16.0']) {
        assert.ok(resolved.includes(present), `expected ${present}`);
      }
      for (const absent of ['chrome 107', 'firefox 120', 'safari 15.6', 'ie 11', 'op_mini all']) {
        assert.ok(!resolved.includes(absent), `must not include ${absent}`);
      }
    });
  });
}
