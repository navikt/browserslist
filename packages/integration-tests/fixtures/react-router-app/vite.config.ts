import { reactRouter } from '@react-router/dev/vite';
import navBrowserTargets from '@navikt/browserslist-config/vite';
import { defineConfig } from 'vite';

// NAV_VARIANT:
//   plugin       the documented setup
//   none         control: no Nav plugin (Vite's defaults)
//   user-esnext  the plugin plus an explicit build.target, which must win
const variant = process.env.NAV_VARIANT ?? 'plugin';

export default defineConfig({
  logLevel: 'warn',
  build: variant === 'user-esnext' ? { target: 'esnext' } : {},
  plugins: [reactRouter(), ...(variant === 'none' ? [] : [navBrowserTargets()])],
});
