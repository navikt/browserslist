/**
 * Nav's browser floor as esbuild target strings (e.g. `"chrome108"`), for
 * esbuild's `target`, Vite's `build.target`, and tsup's `target`.
 *
 * Samsung Internet has no esbuild engine name; its floor (21 = Chromium 108)
 * is covered by the chrome entry.
 */
declare const targets: string[];
export default targets;
