import { describe, expect, it } from 'vitest';
import { api } from './api.js';

describe('api client', () => {
  it('uses the default base URL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:3000');
  });

  it('defines default headers', () => {
    expect(api.defaults.headers).toBeDefined();
  });
});
