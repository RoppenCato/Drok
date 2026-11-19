import { defineConfig } from 'vitest/config';

// The rules are tested headless in Node. The screen is judged by a screenshot in the browser pane at phone size.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['rules/test/**/*.test.ts'],
  },
});
