import { vi } from 'vitest';

export const app = {
  initialize: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  getContext: vi.fn().mockResolvedValue({
    app: {
      theme: 'default',
      locale: 'en-us',
    },
  }),
};
