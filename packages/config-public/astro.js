import esbuildTargets from './esbuild.js';
import lightningcssTargets from './lightningcss.js';
import navViteBrowserTargets from './vite.js';

/**
 * Vite plugin for Astro's build environments.
 *
 * Astro hardcodes `build.target: "esnext"` on the top-level build config and on
 * `environments.client`, so the fill-if-unset `./vite` plugin never sees an
 * unset target.
 *
 * Values are assigned by mutation, never returned: Vite merges returned
 * environment config with mergeConfig, which concatenates arrays onto "esnext".
 */
function astroBuildTargets() {
  let topLevelCssTarget;
  return {
    name: 'nav:astro-build-targets',
    config(config) {
      topLevelCssTarget = config.build?.cssTarget;
    },
    configEnvironment(name, config) {
      if (name === 'client') {
        const target = config.build?.target;
        // if build.target isn't set, or is Astro's default of 'esnext' then replace it
        // any other value is treated as an explicit config-choice
        if (target === undefined || target === 'esnext') {
          config.build ??= {};
          config.build.target = [...esbuildTargets];
        }
        // CSS is baked in SSR/prerender
        // again, set only if a config value isn't set
      } else if (name === 'ssr' || name === 'prerender') {
        if (config.build?.cssTarget === undefined && topLevelCssTarget === undefined) {
          config.build ??= {};
          config.build.cssTarget = [...esbuildTargets];
        }
      }
    },
  };
}

/**
 * Astro integration that applies Nav's browser targets to client JS and to
 * the CSS Astro emits, plus the `./vite` plugin's dev pre-bundling and
 * Lightning CSS handling.
 */
export default function navBrowserTargets() {
  return {
    name: 'nav:browser-targets',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({ vite: { plugins: [navViteBrowserTargets(), astroBuildTargets()] } });
      },
    },
  };
}

// Manual escape hatch: identical to the ./esbuild and ./lightningcss exports.
export const targets = esbuildTargets;
export { lightningcssTargets };

// Lets a stray require() of this module return the factory (Node >= 22.12).
export { navBrowserTargets as 'module.exports' };
