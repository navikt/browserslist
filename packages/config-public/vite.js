import esbuildTargets from './esbuild.js';
import lightningcssTargets from './lightningcss.js';

/**
 * Vite plugin that applies Nav's browser targets wherever the config has not
 * already set them. User-provided values always win; values are filled, never
 * merged (Vite's own mergeConfig concatenates arrays, and Oxc rejects
 * duplicate target entries).
 */
export default function navBrowserTargets() {
  return {
    name: 'nav:browser-targets',
    config(config) {
      config.build ??= {};
      // build.cssTarget derives from build.target automatically — leave it alone.
      config.build.target ??= [...esbuildTargets];

      // Vite 8's dev-server dependency pre-bundling uses Vite's own baseline
      // targets, not build.target; align it to avoid dev/prod skew. On Vite 7
      // this key is unknown and inert (use optimizeDeps.esbuildOptions.target
      // there if dev parity matters — production output is unaffected).
      config.optimizeDeps ??= {};
      config.optimizeDeps.rolldownOptions ??= {};
      config.optimizeDeps.rolldownOptions.transform ??= {};
      config.optimizeDeps.rolldownOptions.transform.target ??= [...esbuildTargets];

      // The opt-in Lightning CSS transformer defaults its targets to Vite's
      // baseline constant, not build.target.
      if (config.css?.transformer === 'lightningcss') {
        config.css.lightningcss ??= {};
        config.css.lightningcss.targets ??= { ...lightningcssTargets };
      }
    },
  };
}

// Manual escape hatch: the same values the plugin applies, for teams that
// prefer to assign config.build.target etc. themselves. Identical to the
// ./esbuild and ./lightningcss exports.
export const targets = esbuildTargets;
export { lightningcssTargets };

// Lets a stray require() of this module return the factory (Node >= 22.12).
export { navBrowserTargets as 'module.exports' };
