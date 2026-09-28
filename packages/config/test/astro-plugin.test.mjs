import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import navBrowserTargets, { targets, lightningcssTargets } from '../astro.js';
import esbuildTargets from '../esbuild.js';
import lcssTargets from '../lightningcss.js';

function getPlugins() {
  let plugins;
  navBrowserTargets().hooks['astro:config:setup']({
    updateConfig: (cfg) => {
      plugins = cfg.vite.plugins;
    },
  });
  return plugins;
}

// Mimics Vite's order: every plugin's `config` hook, then every plugin's
// `configEnvironment` hook per environment (mutating the raw env config).
function apply(config) {
  const plugins = getPlugins();
  for (const p of plugins) p.config?.(config);
  for (const p of plugins) {
    for (const [name, env] of Object.entries(config.environments ?? {})) {
      p.configEnvironment?.(name, env);
    }
  }
  return config;
}

// Shape of the config Astro hands to Vite for `astro build`.
function astroBuildConfig(overrides = {}) {
  return {
    build: { target: 'esnext', ...overrides.build },
    environments: {
      prerender: { build: { ssr: true, ...overrides.prerender } },
      client: { build: { target: 'esnext', ...overrides.client } },
      ssr: { build: { ...overrides.ssr } },
    },
  };
}

describe('astro integration', () => {
  it('registers the vite plugin and the astro build-targets plugin', () => {
    const integration = navBrowserTargets();
    assert.equal(integration.name, 'nav:browser-targets');
    assert.deepEqual(
      getPlugins().map((p) => p.name),
      ['nav:browser-targets', 'nav:astro-build-targets'],
    );
  });

  it("replaces the client's hardcoded esnext target; server JS stays esnext", () => {
    const config = apply(astroBuildConfig());
    assert.deepEqual(config.environments.client.build.target, esbuildTargets);
    assert.equal(config.build.target, 'esnext');
    assert.equal(config.environments.ssr.build.target, undefined);
    assert.equal(config.environments.prerender.build.target, undefined);
  });

  it('fills cssTarget on ssr/prerender (Astro emits page CSS from there), not on client', () => {
    const config = apply(astroBuildConfig());
    assert.deepEqual(config.environments.ssr.build.cssTarget, esbuildTargets);
    assert.deepEqual(config.environments.prerender.build.cssTarget, esbuildTargets);
    assert.equal(config.environments.client.build.cssTarget, undefined);
  });

  it('fills an unset client target (dev config shape)', () => {
    const config = apply({ environments: { client: {} } });
    assert.deepEqual(config.environments.client.build.target, esbuildTargets);
  });

  it('keeps a non-esnext client target as a user choice', () => {
    const config = apply(astroBuildConfig({ client: { target: ['es2020'] } }));
    assert.deepEqual(config.environments.client.build.target, ['es2020']);
  });

  it('never overrides a user cssTarget, environment-level or top-level', () => {
    const envLevel = apply(astroBuildConfig({ ssr: { cssTarget: 'chrome120' } }));
    assert.equal(envLevel.environments.ssr.build.cssTarget, 'chrome120');
    assert.deepEqual(envLevel.environments.prerender.build.cssTarget, esbuildTargets);

    const topLevel = apply(astroBuildConfig({ build: { cssTarget: 'chrome120' } }));
    assert.equal(topLevel.environments.ssr.build.cssTarget, undefined);
    assert.equal(topLevel.environments.prerender.build.cssTarget, undefined);
  });

  it('leaves unknown environments alone', () => {
    const config = apply({ environments: { worker: { build: { target: 'esnext' } } } });
    assert.deepEqual(config.environments.worker.build, { target: 'esnext' });
  });

  it('hands out fresh copies so one environment cannot mutate another', () => {
    const config = apply(astroBuildConfig());
    config.environments.client.build.target.push('es5');
    assert.deepEqual(config.environments.ssr.build.cssTarget, esbuildTargets);
    assert.ok(!esbuildTargets.includes('es5'));
  });

  it('exposes the manual escape hatch: the exact ./esbuild and ./lightningcss values', () => {
    assert.equal(targets, esbuildTargets);
    assert.equal(lightningcssTargets, lcssTargets);
  });
});
