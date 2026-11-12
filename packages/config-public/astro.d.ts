import type { NavBrowserTargetsPlugin } from './vite.js';

export interface NavAstroBuildTargetsPlugin {
  name: 'nav:astro-build-targets';
  config(config: object): void;
  configEnvironment(name: string, config: object): void;
}

// We manually write out a type here for the Astro plugin because
// otherwise we'd have to peerDep Astro.
// Many projects would automatically bring a peerDep dep in, ew.
export interface NavBrowserTargetsIntegration {
  name: 'nav:browser-targets';
  hooks: {
    'astro:config:setup': (options: {
      updateConfig: (config: { vite: { plugins: [NavBrowserTargetsPlugin, NavAstroBuildTargetsPlugin] } }) => unknown;
    }) => void;
  };
}

/**
 * The client target is replaced when unset or `"esnext"` (Astro's hardcoded
 * default); any other value is kept. `cssTarget` is only filled when unset.
 *
 * ```ts
 * import navBrowserTargets from '@navikt/browserslist-config-public/astro';
 * export default defineConfig({ integrations: [navBrowserTargets()] });
 * ```
 */
export default function navBrowserTargets(): NavBrowserTargetsIntegration;

/** esbuild/Vite `build.target` strings — identical to the `./esbuild` export. */
export const targets: typeof import('./esbuild.js').default;
/** Lightning CSS `targets` object — identical to the `./lightningcss` export. */
export const lightningcssTargets: typeof import('./lightningcss.js').default;
