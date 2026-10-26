/**
 * An oxlint preset built from the generated rule maps: jsPlugins with absolute
 * specifiers plus the rule map. Structurally assignable to oxlint's
 * `OxlintConfig`, so it can be passed to `defineConfig({ extends: [...] })`
 * in oxlint.config.ts.
 */
export interface OxlintPreset {
  jsPlugins: { name: string; specifier: string }[];
  rules: Record<string, 'error' | ['error', ...unknown[]]>;
}

/** compat pinned to the floor + the wrapped browser-support rules. */
export declare const recommended: OxlintPreset;
/** The asserted-ES-level syntax layer for files served without a bundler. */
export declare const unbundled: OxlintPreset;

declare const presets: { recommended: OxlintPreset; unbundled: OxlintPreset };
export default presets;
