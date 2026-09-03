import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, it } from 'node:test';
import { promisify } from 'node:util';

const require = createRequire(import.meta.url);
const run = promisify(execFile);

const pluginDir = path.dirname(require.resolve('@navikt/browser-support-linting/package.json'));

const REQUIRED = [
  'data/support.json',
  'features.json',
  'index.d.ts',
  'index.js',
  'lib/configs.generated.js',
  'lib/levels.js',
  'lib/rules.generated.js',
  'lib/wrap.js',
  'oxlint.d.ts',
  'oxlint.js',
  'package.json',
];
// Auto-included by npm when present; not errors if absent during development.
const OPTIONAL = ['CHANGELOG.md', 'LICENSE', 'README.md'];

describe('published plugin tarball contents', () => {
  it('contains exactly the intended files (no scripts/, test/, or strays)', { timeout: 30_000 }, async () => {
    const { stdout } = await run('npm', ['pack', '--dry-run', '--json'], { cwd: pluginDir });
    const files = JSON.parse(stdout)[0].files.map((f) => f.path).sort();

    for (const file of REQUIRED) {
      assert.ok(files.includes(file), `tarball must contain ${file}`);
    }
    const allowed = new Set([...REQUIRED, ...OPTIONAL]);
    assert.deepEqual(files.filter((f) => !allowed.has(f)), []);
  });
});
