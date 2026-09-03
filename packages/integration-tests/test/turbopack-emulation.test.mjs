import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import queries from '@navikt/browserslist-config';
import esbuildTargets from '@navikt/browserslist-config/esbuild';

const testsDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const run = promisify(execFile);

/**
 * browserslist-rs (Turbopack, Rspack) resolves `extends` by literally spawning
 *   node -p "JSON.stringify(require('<pkg>'))"
 * with NO __esModule interop. If this test fails, every Next 16 consumer gets a
 * silently empty browser list. Byte-for-byte emulation of that code path.
 */
describe('browserslist-rs extends emulation', () => {
  it('node -p JSON.stringify(require(pkg)) prints the exact query array', async () => {
    const { stdout } = await run(
      'node',
      ['-p', 'JSON.stringify(require("@navikt/browserslist-config"))'],
      { cwd: testsDir },
    );
    assert.deepEqual(JSON.parse(stdout), queries);
  });

  it('the array is not wrapped in { default } or an env object', async () => {
    const { stdout } = await run(
      'node',
      ['-p', 'Array.isArray(require("@navikt/browserslist-config"))'],
      { cwd: testsDir },
    );
    assert.equal(stdout.trim(), 'true');
  });

  // The ESM subpaths export their value as 'module.exports', so a stray
  // require() returns the raw value instead of a module namespace.
  it('require() of an ESM subpath returns the raw value via the interop export', async () => {
    const { stdout } = await run(
      'node',
      ['-p', 'JSON.stringify(require("@navikt/browserslist-config/esbuild"))'],
      { cwd: testsDir },
    );
    assert.deepEqual(JSON.parse(stdout), esbuildTargets);
  });
});
