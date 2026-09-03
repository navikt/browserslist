import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import browserslist from 'browserslist';
import { transformSync } from 'esbuild';
import { browserslistToTargets, transform as lightningcssTransform } from 'lightningcss';
import queries from '@navikt/browserslist-config';
import esbuildTargets from '@navikt/browserslist-config/esbuild';
import lightningcssTargets from '@navikt/browserslist-config/lightningcss';

describe('esbuild', () => {
  it('accepts the target strings and lowers class static blocks (Safari floor < 16.4)', () => {
    const source = 'class A { static { A.ready = true } }';
    const lowered = transformSync(source, { target: esbuildTargets }).code;
    assert.ok(!lowered.includes('static {'), 'static block should be lowered');

    const untouched = transformSync(source, { target: 'esnext' }).code;
    assert.ok(untouched.includes('static {'));
  });

  it('leaves ES2021 syntax (logical assignment) alone at these targets', () => {
    const { code } = transformSync('a ||= b;', { target: esbuildTargets });
    assert.equal(code.trim(), 'a ||= b;');
  });
});

describe('lightningcss', () => {
  it('accepts the precomputed targets object', () => {
    const { code } = lightningcssTransform({
      filename: 'smoke.css',
      code: Buffer.from('.a { user-select: none; }'),
      targets: lightningcssTargets,
    });
    // Safari 16 still needs the -webkit- prefix for user-select.
    assert.ok(code.toString().includes('-webkit-user-select'));
  });

  it('matches a fresh browserslistToTargets() derivation of the query array', () => {
    assert.deepEqual(lightningcssTargets, browserslistToTargets(browserslist(queries)));
  });
});
