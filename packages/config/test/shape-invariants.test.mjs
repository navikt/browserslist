import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import queries from '../index.js';
import esbuildTargets from '../esbuild.js';
import lightningcssTargets, { safari as lcssSafari } from '../lightningcss.js';
import remixTarget from '../remix.js';

const require = createRequire(import.meta.url);
const pkgDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const browsers = JSON.parse(readFileSync(path.join(pkgDir, 'browsers.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));

describe('shareable-config protocol invariants (browserslist + browserslist-rs)', () => {
  it('the CJS twin require()s to a plain array identical to the ESM default', () => {
    const twin = require('../index.cjs');
    assert.ok(Array.isArray(twin));
    assert.deepEqual(twin, queries);
  });

  it('the root exports map routes require() to the CJS twin', () => {
    assert.equal(pkg.exports['.'].require.default, './index.cjs');
    assert.equal(pkg.type, 'module');
  });

  it('root export has one query per configured family', () => {
    assert.equal(queries.length, Object.keys(browsers).length);
    for (const [family, version] of Object.entries(browsers)) {
      assert.ok(queries.includes(`${family} >= ${version}`), `missing query for ${family}`);
    }
  });

  it('every export survives a JSON round-trip unchanged', () => {
    for (const value of [queries, esbuildTargets, lightningcssTargets, remixTarget]) {
      assert.deepEqual(JSON.parse(JSON.stringify(value)), value);
    }
  });
});

describe('cross-export consistency', () => {
  it('esbuild targets have no duplicates (Oxc rejects them) and omit only samsung', () => {
    assert.equal(new Set(esbuildTargets).size, esbuildTargets.length);
    const expected = Object.entries(browsers)
      .filter(([family]) => family !== 'samsung')
      .map(([family, version]) => `${family === 'ios_saf' ? 'ios' : family}${version}`)
      .sort();
    assert.deepEqual(esbuildTargets, expected);
  });

  it('lightningcss targets use (major << 16 | minor << 8) encoding of the floor', () => {
    for (const [family, version] of Object.entries(browsers)) {
      const [major, minor = 0] = version.split('.').map(Number);
      assert.equal(lightningcssTargets[family], (major << 16) | (minor << 8));
    }
    assert.deepEqual(Object.keys(lightningcssTargets).sort(), Object.keys(browsers).sort());
    assert.equal(lcssSafari, lightningcssTargets.safari);
  });

  it('remix target has every family as a version string, with ios_saf keyed as ios', () => {
    const expected = Object.fromEntries(
      Object.entries(browsers).map(([family, version]) => [family === 'ios_saf' ? 'ios' : family, version]),
    );
    assert.deepEqual(remixTarget, expected);
    for (const version of Object.values(remixTarget)) {
      // remix/assets accepts only "X", "X.Y" or "X.Y.Z" strings.
      assert.match(version, /^\d+(\.\d+){0,2}$/);
    }
  });
});
