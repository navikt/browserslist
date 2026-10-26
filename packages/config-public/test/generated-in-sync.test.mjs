import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { derive, validateResolution } from '../scripts/generate.mjs';

const pkgDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const spec = JSON.parse(readFileSync(path.join(pkgDir, 'browsers.json'), 'utf8'));
const derived = derive(spec);

describe('generated files are in sync with browsers.json', () => {
  for (const name of Object.keys(derived.files)) {
    it(`${name} matches derive() output`, () => {
      const onDisk = readFileSync(path.join(pkgDir, name), 'utf8');
      assert.equal(onDisk, derived.files[name]);
    });
  }

  it('queries resolve to exactly the configured families with nothing below floor', () => {
    // Throws on violation; returns advisory notes for floors between known caniuse versions.
    const notes = validateResolution(spec, derived.queries);
    assert.deepEqual(notes, []);
  });
});
