import { createRequire } from 'node:module';
import compat from 'eslint-plugin-compat';
import esx from 'eslint-plugin-es-x';
import { wrapEsxRule } from './lib/wrap.js';
import { wrappedRules } from './lib/rules.generated.js';
import { recommendedRules, unbundledRules } from './lib/configs.generated.js';
import { levels } from './lib/levels.js';

const require = createRequire(import.meta.url);
const { name, version } = require('./package.json');

const rules = {};
for (const { esxId, messageSuffix, docsUrl } of wrappedRules) {
  const baseRule = esx.rules[esxId];
  if (!baseRule) {
    throw new Error(
      `Generated rule "${esxId}" is missing from the installed eslint-plugin-es-x — regenerate: pnpm --filter ${name} generate`,
    );
  }
  rules[esxId] = wrapEsxRule(baseRule, { messageSuffix, docsUrl });
}

const plugin = {
  meta: { name, version },
  rules,
  levels,
  configs: {},
};

plugin.configs.recommended = [
  compat.configs['flat/recommended'],
  {
    name: 'browser-support/recommended',
    plugins: { 'browser-support': plugin },
    rules: recommendedRules,
  },
];

plugin.configs.unbundled = [
  {
    name: 'browser-support/unbundled',
    plugins: { 'es-x': esx },
    rules: unbundledRules,
  },
];

export default plugin;
export { levels };
export const configs = plugin.configs;
// Just in case someone tries to 'require'
export { plugin as 'module.exports' };
