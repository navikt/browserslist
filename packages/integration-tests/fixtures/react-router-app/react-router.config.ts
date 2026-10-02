import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
  // Each test build writes to its own temp directory.
  buildDirectory: process.env.NAV_BUILD_DIR ?? 'build',
} satisfies Config;
