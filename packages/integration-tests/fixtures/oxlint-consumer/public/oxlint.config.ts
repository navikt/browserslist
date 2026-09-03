// Served as-is (no bundler): layer the unbundled preset on top.
import { defineConfig } from 'oxlint';
import browserSupport from '@navikt/browser-support-linting/oxlint';

export default defineConfig({
  extends: [browserSupport.recommended, browserSupport.unbundled],
});
