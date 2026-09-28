import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const require = createRequire(import.meta.url);
const testsDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const SUBPATHS = [
  '@navikt/browserslist-config',
  '@navikt/browserslist-config/esbuild',
  '@navikt/browserslist-config/lightningcss',
  '@navikt/browserslist-config/vite',
  '@navikt/browserslist-config/astro',
  '@navikt/browserslist-config/browsers.json',
  '@navikt/browserslist-config/package.json',
];

describe('exports map', () => {
  for (const subpath of SUBPATHS) {
    it(`${subpath} resolves via require.resolve()`, () => {
      assert.doesNotThrow(() => require.resolve(subpath));
    });
  }

  it('ESM imports get real ESM modules with default exports', async () => {
    const root = await import('@navikt/browserslist-config');
    assert.ok(Array.isArray(root.default));
    const esbuild = await import('@navikt/browserslist-config/esbuild');
    assert.ok(Array.isArray(esbuild.default));
    const vite = await import('@navikt/browserslist-config/vite');
    assert.equal(typeof vite.default, 'function');
    assert.equal(vite.default().name, 'nav:browser-targets');
    const astro = await import('@navikt/browserslist-config/astro');
    assert.equal(typeof astro.default, 'function');
    assert.equal(typeof astro.default().hooks['astro:config:setup'], 'function');
  });

  it('root require() gets the CJS twin, value-identical to the ESM default', async () => {
    const twin = require('@navikt/browserslist-config');
    const { default: esm } = await import('@navikt/browserslist-config');
    assert.ok(Array.isArray(twin));
    assert.deepEqual(twin, esm);
  });

  // Spawned bare node with static import syntax: a missing named export is a
  // link-time SyntaxError there — the strictest form of this check.
  it('named ESM exports link in bare Node (lightningcss families, vite/astro escape hatches)', async () => {
    const script = [
      'import { safari, chrome } from "@navikt/browserslist-config/lightningcss";',
      'import { targets } from "@navikt/browserslist-config/vite";',
      'import { targets as astroTargets } from "@navikt/browserslist-config/astro";',
      'import esbuildTargets from "@navikt/browserslist-config/esbuild";',
      'const same = JSON.stringify(targets) === JSON.stringify(esbuildTargets) && astroTargets === targets;',
      'console.log(JSON.stringify([chrome, safari, same]));',
    ].join('\n');
    const { stdout } = await promisify(execFile)('node', ['--input-type=module', '-e', script], {
      cwd: testsDir,
    });
    assert.deepEqual(JSON.parse(stdout), [108 << 16, 16 << 16, true]);
  });
});
