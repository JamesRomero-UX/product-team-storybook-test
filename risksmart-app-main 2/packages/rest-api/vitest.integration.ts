import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [tsconfigPaths() as any],
  test: {
    globals: true,
    include: ['./**/*.int.test.ts'],
    env: {
      SST_STAGE: 'int',
      SENTRY_RELEASE: 'int',
    },
  },
});
