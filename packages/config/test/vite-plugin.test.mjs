import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import navBrowserTargets, { targets, lightningcssTargets } from '../vite.js';
import esbuildTargets from '../esbuild.js';
import lcssTargets from '../lightningcss.js';

function applyTo(config) {
  navBrowserTargets().config(config);
  return config;
}

describe('vite plugin', () => {
  it('fills build.target, pre-bundling target — and leaves cssTarget alone (derives from target)', () => {
    const config = applyTo({});
    assert.deepEqual(config.build.target, esbuildTargets);
    assert.equal(config.build.cssTarget, undefined);
    assert.deepEqual(config.optimizeDeps.rolldownOptions.transform.target, esbuildTargets);
    assert.equal(config.css, undefined);
  });

  it('never overrides user-provided values, and never concatenates arrays', () => {
    const config = applyTo({
      build: { target: ['es2020'] },
      optimizeDeps: { rolldownOptions: { transform: { target: 'esnext' } } },
    });
    assert.deepEqual(config.build.target, ['es2020']);
    assert.equal(config.optimizeDeps.rolldownOptions.transform.target, 'esnext');
  });

  it('fills lightningcss targets only when the transformer is opted in', () => {
    const optedIn = applyTo({ css: { transformer: 'lightningcss' } });
    assert.deepEqual(optedIn.css.lightningcss.targets, lcssTargets);

    const userTargets = { chrome: 999 };
    const preset = applyTo({
      css: { transformer: 'lightningcss', lightningcss: { targets: userTargets } },
    });
    assert.equal(preset.css.lightningcss.targets, userTargets);

    const postcss = applyTo({ css: { modules: {} } });
    assert.equal(postcss.css.lightningcss, undefined);
  });

  it('hands out fresh copies so one config cannot mutate another build', () => {
    const a = applyTo({});
    const b = applyTo({});
    a.build.target.push('es5');
    assert.deepEqual(b.build.target, esbuildTargets);
    assert.ok(!esbuildTargets.includes('es5'));
  });

  it('exposes the manual escape hatch: the exact ./esbuild and ./lightningcss values', () => {
    assert.equal(targets, esbuildTargets);
    assert.equal(lightningcssTargets, lcssTargets);
  });
});
