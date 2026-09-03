import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const testsDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const fixtureDir = path.join(testsDir, 'fixtures', 'oxlint-consumer');
const oxlintBin = path.join(testsDir, 'node_modules', '.bin', 'oxlint');

async function lint(configPath, target) {
  const args = ['-c', configPath, '--format=json', target];
  try {
    const { stdout } = await run(oxlintBin, args, { cwd: fixtureDir });
    return JSON.parse(stdout).diagnostics;
  } catch (error) {
    // oxlint exits non-zero when it finds errors; the JSON is still on stdout.
    if (!error.stdout) throw error;
    return JSON.parse(error.stdout).diagnostics;
  }
}

const codesFor = (diagnostics, file) =>
  diagnostics
    .filter((d) => d.filename === file)
    .map((d) => d.code)
    .sort();

// The consumer story: oxlint.config.ts extends the preset objects imported
// from the /oxlint entrypoint. oxlint's object `extends` carries no file
// context, so the entrypoint resolves every jsPlugins specifier to an absolute
// path inside the plugin package — the consumer installs nothing extra and
// configures nothing else.
describe('the oxlint presets via oxlint.config.ts', () => {
  it('recommended: builtins, Web APIs and regex features are flagged with the floor messages', { timeout: 30_000 }, async () => {
    const diagnostics = await lint('oxlint.config.ts', 'src');

    // The lookbehind line is reported twice by design: once by the wrapped
    // rule (with guidance) and once by compat's own version-keyed check.
    assert.deepEqual(codesFor(diagnostics, 'src/app.js'), [
      'browser-support(no-array-prototype-tosorted)',
      'browser-support(no-object-groupby)',
      'browser-support(no-regexp-lookbehind-assertions)',
      'compat(compat)',
      'compat(compat)',
    ]);

    const tosorted = diagnostics.find((d) => d.code === 'browser-support(no-array-prototype-tosorted)');
    assert.match(tosorted.message, /Below Nav's browser floor — needs Chrome 110\+ \(floor 108\)/);

    const urlpattern = diagnostics.find((d) => d.message.includes('URLPattern'));
    assert.match(urlpattern.message, /Safari 16\.0/, 'compat must check the floor, not browserslist defaults');
  });

  it('recommended: the sanctioned feature-guard shapes stay clean', { timeout: 30_000 }, async () => {
    const diagnostics = await lint('oxlint.config.ts', 'src');
    assert.deepEqual(codesFor(diagnostics, 'src/clean.js'), []);
  });

  it('unbundled preset layers on top for files served without a bundler', { timeout: 30_000 }, async () => {
    const diagnostics = await lint('public/oxlint.config.ts', 'public');
    assert.deepEqual(codesFor(diagnostics, 'public/inline.js'), ['es-x(no-class-static-block)']);
  });
});
