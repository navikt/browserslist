import type { ESLint, Linter, Rule } from 'eslint';

/** The floor-derived levels this plugin asserts; guarded by its marker tests. */
export interface Levels {
  es: {
    /** The newest ES edition completely native at the floor. */
    year: number;
    caveats: string[];
  };
  baseline: {
    /** The approximate Baseline year the floor corresponds to. */
    year: number;
    approximate: boolean;
  };
}

export interface BrowserSupportPlugin extends ESLint.Plugin {
  meta: { name: string; version: string };
  rules: Record<string, Rule.RuleModule>;
  levels: Levels;
  configs: {
    /**
     * eslint-plugin-compat (Web APIs vs the consumer's browserslist, which
     * must extend @navikt/browserslist-config) + wrapped eslint-plugin-es-x
     * rules for builtins below the floor that nothing polyfills.
     */
    recommended: Linter.Config[];
    /**
     * Opt-in, for files served without a bundler (inline scripts, CDN files):
     * restricts to the asserted ES level. Apply with a `files` filter.
     */
    unbundled: Linter.Config[];
  };
}

export declare const levels: Levels;
export declare const configs: BrowserSupportPlugin['configs'];

declare const plugin: BrowserSupportPlugin;
export default plugin;
