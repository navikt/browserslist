import assert from 'node:assert/strict';
import path from 'node:path';
import { before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import plugin from '../index.js';

// The fixture app deliberately has NO browserslist config: the preset must be
// self-contained, with compat's targets baked in as the rule's option. If the
// floor query ever stopped reaching compat, the api-caught assertions would
// fail here (compat would fall back to browserslist defaults, which are far
// newer than the floor and miss most of these APIs).
const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'app');

describe('configs.recommended end-to-end over fixture files', () => {
  /** @type {Map<string, import('eslint').Linter.LintMessage[]>} */
  let messagesByFile;

  before(async () => {
    const eslint = new ESLint({
      cwd: fixtureDir,
      overrideConfigFile: true,
      overrideConfig: plugin.configs.recommended,
    });
    const results = await eslint.lintFiles(['src/**/*.js']);
    messagesByFile = new Map(results.map((result) => [path.basename(result.filePath), result.messages]));
    assert.equal(messagesByFile.size, 4, 'all four fixture files were linted');
  });

  it('flags a below-floor builtin with the floor-specific message', () => {
    const messages = messagesByFile.get('builtin-tosorted.js');
    assert.equal(messages.length, 1);
    assert.equal(messages[0].ruleId, 'browser-support/no-array-prototype-tosorted');
    assert.match(messages[0].message, /Below Nav's browser floor — needs Chrome 110\+/);
  });

  it('accepts the sanctioned feature-guard shapes', () => {
    assert.deepEqual(messagesByFile.get('builtin-guarded.js'), []);
  });

  it('compat flags the Web APIs it can detect', () => {
    const messages = messagesByFile.get('api-caught.js');
    for (const message of messages) {
      assert.equal(message.ruleId, 'compat/compat');
    }
    for (const api of ['URLPattern', 'WebTransport', 'ReportingObserver', 'Highlight', 'requestIdleCallback', 'Navigation.navigate']) {
      assert.ok(
        messages.some((message) => message.message.includes(api)),
        `expected a compat/compat diagnostic for ${api}; got: ${JSON.stringify(messages.map((m) => m.message))}`,
      );
    }
  });

  // Gap-pinning: these APIs are below the floor but invisible to compat's
  // detection data today. If a compat upgrade starts flagging one, this test
  // fails so features.json compatCoverage and the README table get updated.
  it('compat still misses the documented gaps (popover, view transitions, AbortSignal.any, checkVisibility)', () => {
    assert.deepEqual(messagesByFile.get('api-missed.js'), []);
  });
});
