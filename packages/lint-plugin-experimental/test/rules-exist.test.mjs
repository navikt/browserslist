import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Linter } from 'eslint';
import esx from 'eslint-plugin-es-x';
import plugin from '../index.js';
import { wrappedRules } from '../lib/rules.generated.js';

describe('the generated selection matches the installed eslint-plugin-es-x', () => {
  it('every wrapped rule id exists in es-x', () => {
    for (const { esxId } of wrappedRules) {
      assert.ok(esx.rules[esxId], `es-x has no rule "${esxId}" — regenerate against the installed version`);
    }
  });

  it('every wrapped rule is registered on the plugin', () => {
    assert.deepEqual(
      Object.keys(plugin.rules).sort(),
      [...new Set(wrappedRules.map((r) => r.esxId))].sort(),
    );
  });

  // Linter validates rule options against each rule's schema eagerly, so a
  // generated option no rule accepts fails here, not in a consumer's editor.
  // The full array is needed: the second config's compat/compat override
  // relies on the first config registering the compat plugin.
  it('configs.recommended rule options pass schema validation', () => {
    const messages = new Linter().verify('const ok = 1;\n', plugin.configs.recommended);
    assert.deepEqual(messages, []);
  });

  it('configs.unbundled rule options pass schema validation', () => {
    const messages = new Linter().verify('const ok = 1;\n', plugin.configs.unbundled[0]);
    assert.deepEqual(messages, []);
  });
});
