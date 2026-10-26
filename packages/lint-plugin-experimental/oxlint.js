import { fileURLToPath } from 'node:url';
import { recommendedRules, unbundledRules } from './lib/configs.generated.js';

const resolve = (specifier) => fileURLToPath(import.meta.resolve(specifier));

export const recommended = {
  jsPlugins: [
    { name: 'browser-support', specifier: resolve('./index.js') },
    { name: 'compat', specifier: resolve('eslint-plugin-compat') },
  ],
  rules: recommendedRules,
};

export const unbundled = {
  jsPlugins: [{ name: 'es-x', specifier: resolve('eslint-plugin-es-x') }],
  rules: unbundledRules,
};

const presets = { recommended, unbundled };
export default presets;
