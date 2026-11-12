// Manually write out the type for Vite so we avoid Vite as a peerDep.
// Many projects would automatically bring a peerDep dep in, ew.
export interface NavBrowserTargetsPlugin {
  name: 'nav:browser-targets';
  /** Fills Vite's (mutable) user config where it's unset. */
  config(config: object): void;
}

/**
 * ```ts
 * import navBrowserTargets from '@navikt/browserslist-config-public/vite';
 * export default defineConfig({ plugins: [navBrowserTargets()] });
 * ```
 *
 * Prefer wiring things up yourself? The named exports are the exact values the
 * plugin applies:
 *
 * ```ts
 * import { targets } from '@navikt/browserslist-config-public/vite';
 * export default defineConfig({ build: { target: targets } });
 * ```
 */
export default function navBrowserTargets(): NavBrowserTargetsPlugin;

/** esbuild/Vite `build.target` strings — identical to the `./esbuild` export. */
export const targets: typeof import('./esbuild.js').default;
/** Lightning CSS `targets` object — identical to the `./lightningcss` export. */
export const lightningcssTargets: typeof import('./lightningcss.js').default;
