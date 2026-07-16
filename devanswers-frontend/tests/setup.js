import '@testing-library/jest-dom'; // for custom matchers
import { server } from './mocks/server';
import { beforeAll, afterEach, afterAll } from 'vitest';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset any request handlers that we may add during tests
afterEach(() => server.resetHandlers());

// Clean up after tests are finished
afterAll(() => server.close());