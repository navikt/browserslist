import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import esxPlugin from 'eslint-plugin-es-x';
import { derive, featureTable } from '../scripts/generate.mjs';

const require = createRequire(import.meta.url);
const pkgDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const featuresJson = JSON.parse(readFileSync(path.join(pkgDir, 'features.json'), 'utf8'));
const browsers = require('@navikt/browserslist-config/browsers.json');
const bcd = require('@mdn/browser-compat-data');

const derived = derive(featuresJson, browsers, bcd, esxPlugin, bcd.__meta.version);

describe('generated files are in sync with features.json × BCD × the floor', () => {
  for (const [name, content] of Object.entries(derived.files)) {
    it(`${name} matches a fresh derivation`, () => {
      assert.equal(readFileSync(path.join(pkgDir, name), 'utf8'), content);
    });
  }

  it('README.md feature table matches a fresh derivation', () => {
    const readme = readFileSync(path.join(pkgDir, 'README.md'), 'utf8');
    const begin = '<!-- BEGIN generated-feature-table -->';
    const end = '<!-- END generated-feature-table -->';
    const start = readme.indexOf(begin);
    const stop = readme.indexOf(end);
    assert.ok(start !== -1 && stop !== -1, 'README.md must contain the generated-feature-table markers');
    const table = featureTable(featuresJson, derived.support, derived.wrappedRules);
    assert.equal(readme.slice(start + begin.length, stop).trim(), table.trim());
  });

  it('derivation raises no curation warnings (a warning means features.json needs a deliberate update)', () => {
    assert.deepEqual(derived.warnings, []);
  });
});
