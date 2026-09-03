import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);

describe('plugin exports map', () => {
  it('root and ./package.json resolve via require.resolve()', () => {
    assert.doesNotThrow(() => require.resolve('@navikt/browser-support-linting'));
    assert.doesNotThrow(() => require.resolve('@navikt/browser-support-linting/package.json'));
  });

  it('ESM import gets the plugin with rules, configs and levels', async () => {
    const { default: plugin, configs, levels } = await import('@navikt/browser-support-linting');
    assert.equal(plugin.meta.name, '@navikt/browser-support-linting');
    assert.ok(Object.keys(plugin.rules).length > 0);
    assert.ok(Array.isArray(configs.recommended));
    assert.ok(Array.isArray(configs.unbundled));
    assert.equal(typeof levels.es.year, 'number');
  });

  // The package is ESM-only; a stray require() still works on Node >= 22.12
  // through the `export { plugin as 'module.exports' }` interop line.
  it('require() of the ESM entry returns the plugin, value-identical to the ESM default', async () => {
    const required = require('@navikt/browser-support-linting');
    const { default: imported } = await import('@navikt/browser-support-linting');
    assert.equal(required, imported);
  });

  it('/oxlint hands out the ESLint configs’ rule maps with absolute jsPlugins specifiers', async () => {
    const { recommended, unbundled } = await import('@navikt/browser-support-linting/oxlint');
    const { default: plugin } = await import('@navikt/browser-support-linting');
    // Parity: oxlint runs exactly the rules (and options) the ESLint configs do.
    assert.deepEqual(recommended.rules, plugin.configs.recommended[1].rules);
    assert.deepEqual(unbundled.rules, plugin.configs.unbundled[0].rules);
    for (const preset of [recommended, unbundled]) {
      for (const { name, specifier } of preset.jsPlugins) {
        assert.ok(path.isAbsolute(specifier), `${name} specifier must be absolute, got: ${specifier}`);
      }
    }
  });
});
