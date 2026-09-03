import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
// Same ESM specifiers as index.js — compat and es-x are dual packages, and
// require() would hand back the *other* (CJS) instance, which is not reference-equal.
import compat from 'eslint-plugin-compat';
import esx from 'eslint-plugin-es-x';
import plugin, { configs, levels } from '../index.js';
import { recommendedRules, unbundledRules } from '../lib/configs.generated.js';
import { wrappedRules } from '../lib/rules.generated.js';

const require = createRequire(import.meta.url);

describe('configs.recommended', () => {
  it('is [compat flat/recommended, the browser-support layer]', () => {
    assert.equal(configs.recommended.length, 2);
    assert.equal(configs.recommended[0], compat.configs['flat/recommended']);
    assert.equal(configs.recommended[0].rules['compat/compat'], 'error');
    assert.equal(configs.recommended[1].name, 'browser-support/recommended');
    assert.equal(configs.recommended[1].plugins['browser-support'], plugin);
    assert.deepEqual(configs.recommended[1].rules, recommendedRules);
  });

  it("pins the compat rule to the floor's browserslist query — no consumer setup", () => {
    const browsers = require('@navikt/browserslist-config/browsers.json');
    const floorQuery = Object.entries(browsers)
      .map(([family, version]) => `${family} >= ${version}`)
      .join(', ');
    assert.deepEqual(recommendedRules['compat/compat'], ['error', floorQuery]);
  });

  it('sets no settings anywhere (oxlint constraint; compat discovers browserslist itself)', () => {
    for (const config of [...configs.recommended, ...configs.unbundled]) {
      assert.equal(config.settings, undefined);
    }
  });
});

describe('configs.unbundled', () => {
  it('registers es-x with the restrict-to-es level minus the recommended overlap', () => {
    assert.equal(configs.unbundled.length, 1);
    assert.equal(configs.unbundled[0].name, 'browser-support/unbundled');
    assert.equal(configs.unbundled[0].plugins['es-x'], esx);
    assert.deepEqual(configs.unbundled[0].rules, unbundledRules);
  });

  it('has zero rule overlap with the wrapped layer (no double reports)', () => {
    const wrappedIds = new Set(wrappedRules.map((r) => r.esxId));
    for (const ruleId of Object.keys(unbundledRules)) {
      assert.ok(!wrappedIds.has(ruleId.replace(/^es-x\//, '')), `${ruleId} is already wrapped`);
    }
  });
});

describe('plugin object', () => {
  it('exposes meta, levels and the configs', () => {
    assert.equal(plugin.meta.name, '@navikt/browser-support-linting');
    assert.ok(plugin.meta.version);
    assert.equal(plugin.levels, levels);
    assert.equal(plugin.configs, configs);
  });
});
