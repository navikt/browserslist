/**
 * Nav's browser floor as a Lightning CSS `targets` object. Versions are packed
 * as `(major << 16) | (minor << 8) | patch`, matching what
 * `browserslistToTargets()` produces.
 */
export const chrome: number;
export const edge: number;
export const firefox: number;
export const safari: number;
export const ios_saf: number;
export const opera: number;
export const samsung: number;

declare const targets: {
  chrome: number;
  edge: number;
  firefox: number;
  safari: number;
  ios_saf: number;
  opera: number;
  samsung: number;
};
export default targets;
