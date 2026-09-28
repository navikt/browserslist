import type { AstroIntegration } from 'astro';

/**
 * Astro integration that applies Nav's browser targets to the client build's
 * JS (`build.target`) and to the CSS Astro emits from its server builds
 * (`build.cssTarget` on `ssr`/`prerender`). Server JS is left untouched.
 * Also includes the `./vite` plugin (dev-server pre-bundling, Lightning CSS
 * transformer targets when opted in).
 *
 * The client target is replaced when unset or `"esnext"` (Astro's hardcoded
 * default); any other value is kept. `cssTarget` is only filled when unset.
 *
 * ```ts
 * import navBrowserTargets from '@navikt/browserslist-config/astro';
 * export default defineConfig({ integrations: [navBrowserTargets()] });
 * ```
 */
export default function navBrowserTargets(): AstroIntegration;

/** esbuild/Vite `build.target` strings — identical to the `./esbuild` export. */
export const targets: typeof import('./esbuild.js').default;
/** Lightning CSS `targets` object — identical to the `./lightningcss` export. */
export const lightningcssTargets: typeof import('./lightningcss.js').default;
