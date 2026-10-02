/**
 * Nav's browser floor as a Remix 3 asset server `target` (the `target` option
 * of `createAssetServer` from `remix/assets`). Applies to both scripts and
 * styles. iOS Safari is keyed `ios`, as Remix expects.
 *
 * ```ts
 * import { createAssetServer } from 'remix/assets';
 * import target from '@navikt/browserslist-config/remix';
 * let assetServer = createAssetServer({ basePath: '/assets', allowFiles: ['app/**'], target });
 * ```
 */
declare const target: {
  chrome: `${number}`;
  edge: `${number}`;
  firefox: `${number}`;
  ios: `${number}`;
  opera: `${number}`;
  safari: `${number}`;
  samsung: `${number}`;
};
export default target;
