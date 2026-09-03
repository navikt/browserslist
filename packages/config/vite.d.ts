import type { Plugin } from 'vite';

/**
 * Vite plugin that applies Nav's browser targets (`build.target`, dev-server
 * dependency pre-bundling, and Lightning CSS transformer targets when opted
 * in) wherever the config has not already set them. User values always win.
 *
 * ```ts
 * import navBrowserTargets from '@navikt/browserslist-config/vite';
 * export default defineConfig({ plugins: [navBrowserTargets()] });
 * ```
 *
 * Prefer wiring things up yourself? The named exports are the exact values the
 * plugin applies:
 *
 * ```ts
 * import { targets } from '@navikt/browserslist-config/vite';
 * export default defineConfig({ build: { target: targets } });
 * ```
 */
export default function navBrowserTargets(): Plugin;

/** esbuild/Vite `build.target` strings — identical to the `./esbuild` export. */
export const targets: typeof import('./esbuild.js').default;
/** Lightning CSS `targets` object — identical to the `./lightningcss` export. */
export const lightningcssTargets: typeof import('./lightningcss.js').default;
