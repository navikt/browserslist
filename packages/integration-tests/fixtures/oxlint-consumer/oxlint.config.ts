import { defineConfig } from 'oxlint';
import browserSupport from '@navikt/browser-support-linting/oxlint';

export default defineConfig({
  extends: [browserSupport.recommended],
});
