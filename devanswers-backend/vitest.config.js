import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    fileParallelism: false,
    // Increase timeouts for MongoDB setup
    testTimeout: 60000, // 60 seconds for each test
    hookTimeout: 60000, // 60 seconds for hooks (beforeAll, afterAll)
  },
});
