import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { RuleTester } from 'eslint';
import plugin from '../index.js';
import { wrappedRules } from '../lib/rules.generated.js';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 'latest' } });

const optionsFor = (esxId) => {
  const entry = wrappedRules.find((r) => r.esxId === esxId);
  return entry.options ? [entry.options] : [];
};

// Three representative rule shapes; the rest share the same wrapping code path.

// Prototype-method rule, aggressive (distinctive name — any receiver reports).
ruleTester.run('browser-support/no-array-prototype-tosorted', plugin.rules['no-array-prototype-tosorted'], {
  valid: [
    { code: 'items.sorted();', options: optionsFor('no-array-prototype-tosorted') },
    // allowTestedProperty sanctions exactly these two feature-guard shapes:
    {
      code: 'const sorted = items.toSorted?.() ?? [...items].sort();',
      options: optionsFor('no-array-prototype-tosorted'),
    },
    {
      code: 'if (Array.prototype.toSorted) { items.toSorted(); }',
      options: optionsFor('no-array-prototype-tosorted'),
    },
  ],
  invalid: [
    {
      code: 'items.toSorted();',
      options: optionsFor('no-array-prototype-tosorted'),
      errors: [{ messageId: 'forbidden' }],
    },
  ],
});

// Static-method rule (global-name based).
ruleTester.run('browser-support/no-object-groupby', plugin.rules['no-object-groupby'], {
  valid: [{ code: 'Object.keys(items);', options: optionsFor('no-object-groupby') }],
  invalid: [
    {
      code: 'Object.groupBy(items, (item) => item.kind);',
      options: optionsFor('no-object-groupby'),
      errors: [{ messageId: 'forbidden' }],
    },
  ],
});

// Regex-literal rule.
ruleTester.run(
  'browser-support/no-regexp-lookbehind-assertions',
  plugin.rules['no-regexp-lookbehind-assertions'],
  {
    valid: [{ code: 'const re = /a?b/;', options: optionsFor('no-regexp-lookbehind-assertions') }],
    invalid: [
      {
        code: 'const re = /(?<=a)b/;',
        options: optionsFor('no-regexp-lookbehind-assertions'),
        errors: [{ messageId: 'forbidden' }],
      },
    ],
  },
);

describe('wrapping', () => {
  it('every wrapped rule message carries its floor-specific suffix and README docs url', () => {
    for (const { esxId, messageSuffix, docsUrl } of wrappedRules) {
      const rule = plugin.rules[esxId];
      for (const message of Object.values(rule.meta.messages)) {
        assert.ok(
          message.endsWith(messageSuffix),
          `${esxId} message does not end with its generated suffix: ${message}`,
        );
      }
      assert.equal(rule.meta.docs.url, docsUrl);
    }
  });
});
