import assert from 'node:assert/strict';
import path from 'node:path';
import { before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
// This package pins the latest ESLint release; the plugin supports ESLint 10.6+
// only (its wrapped eslint-plugin-es-x rules require it).
import { ESLint } from 'eslint';
import { defineConfig } from 'eslint/config';
import browserSupport from '@navikt/browser-support-linting';

const fixtureDir = path.join(
  path.dirname(path.dirname(fileURLToPath(import.meta.url))),
  'fixtures',
  'eslint-consumer',
);

describe('the plugin as a consumer uses it (README config, ESLint 10)', () => {
  let messagesByFile;

  before(async () => {
    assert.match(ESLint.version, /^10\./, 'integration tests must run the supported ESLint major');
    const eslint = new ESLint({
      cwd: fixtureDir,
      overrideConfigFile: true,
      // Exactly the README's consumer example.
      overrideConfig: defineConfig([
        ...browserSupport.configs.recommended,
        { files: ['public/**/*.js'], extends: [browserSupport.configs.unbundled] },
      ]),
    });
    const results = await eslint.lintFiles(['src/**/*.js', 'public/**/*.js']);
    messagesByFile = new Map(
      results.map((result) => [path.basename(result.filePath), result.messages]),
    );
  });

  it('bundled app code gets the builtin and Web-API layers', () => {
    const messages = messagesByFile.get('app.js');
    assert.deepEqual(
      messages.map((message) => message.ruleId).sort(),
      ['browser-support/no-array-prototype-tosorted', 'compat/compat'],
    );
    const builtin = messages.find((m) => m.ruleId === 'browser-support/no-array-prototype-tosorted');
    assert.match(builtin.message, /Below Nav's browser floor/);
  });

  it('unbundled files additionally get the asserted-ES-level syntax layer', () => {
    const messages = messagesByFile.get('inline.js');
    assert.deepEqual(
      messages.map((message) => message.ruleId),
      ['es-x/no-class-static-block'],
    );
  });

  it('exposes the asserted levels', () => {
    assert.equal(browserSupport.levels.es.year, 2021);
    assert.equal(browserSupport.levels.baseline.year, 2022);
  });
});
