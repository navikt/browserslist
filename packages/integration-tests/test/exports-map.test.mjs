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
  '@navikt/browserslist-config-public',
  '@navikt/browserslist-config-public/esbuild',
  '@navikt/browserslist-config-public/lightningcss',
  '@navikt/browserslist-config-public/vite',
  '@navikt/browserslist-config-public/astro',
  '@navikt/browserslist-config-public/remix',
  '@navikt/browserslist-config-public/browsers.json',
  '@navikt/browserslist-config-public/package.json',
];

describe('exports map', () => {
  for (const subpath of SUBPATHS) {
    it(`${subpath} resolves via require.resolve()`, () => {
      assert.doesNotThrow(() => require.resolve(subpath));
    });
  }

  it('ESM imports get real ESM modules with default exports', async () => {
    const root = await import('@navikt/browserslist-config-public');
    assert.ok(Array.isArray(root.default));
    const esbuild = await import('@navikt/browserslist-config-public/esbuild');
    assert.ok(Array.isArray(esbuild.default));
    const vite = await import('@navikt/browserslist-config-public/vite');
    assert.equal(typeof vite.default, 'function');
    assert.equal(vite.default().name, 'nav:browser-targets');
    const astro = await import('@navikt/browserslist-config-public/astro');
    assert.equal(typeof astro.default, 'function');
    assert.equal(typeof astro.default().hooks['astro:config:setup'], 'function');
    const remix = await import('@navikt/browserslist-config-public/remix');
    assert.equal(typeof remix.default.ios, 'string');
  });

  it('root require() gets the CJS twin, value-identical to the ESM default', async () => {
    const twin = require('@navikt/browserslist-config-public');
    const { default: esm } = await import('@navikt/browserslist-config-public');
    assert.ok(Array.isArray(twin));
    assert.deepEqual(twin, esm);
  });

  // Spawned bare node with static import syntax: a missing named export is a
  // link-time SyntaxError there — the strictest form of this check.
  it('named ESM exports link in bare Node (lightningcss families, vite/astro escape hatches)', async () => {
    const script = [
      'import { safari, chrome } from "@navikt/browserslist-config-public/lightningcss";',
      'import { targets } from "@navikt/browserslist-config-public/vite";',
      'import { targets as astroTargets } from "@navikt/browserslist-config-public/astro";',
      'import esbuildTargets from "@navikt/browserslist-config-public/esbuild";',
      'const same = JSON.stringify(targets) === JSON.stringify(esbuildTargets) && astroTargets === targets;',
      'console.log(JSON.stringify([chrome, safari, same]));',
    ].join('\n');
    const { stdout } = await promisify(execFile)('node', ['--input-type=module', '-e', script], {
      cwd: testsDir,
    });
    assert.deepEqual(JSON.parse(stdout), [108 << 16, 16 << 16, true]);
  });
});
