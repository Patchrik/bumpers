import { describe, expect, it } from 'vitest';
import { api } from './api.js';

describe('api service', () => {
  it('uses the api reducer path', () => {
    expect(api.reducerPath).toBe('api');
  });

  it('registers the healthcheck endpoint', () => {
    expect(api.endpoints.healthcheck).toBeDefined();
  });
});
