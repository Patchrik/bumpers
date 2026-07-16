import { describe, expect, it } from 'vitest';
import { queryClient } from './query-client.js';

describe('query client', () => {
  it('disables refetch on window focus', () => {
    expect(queryClient.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
  });

  it('sets a five-minute stale time', () => {
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(5 * 60 * 1000);
  });
});
