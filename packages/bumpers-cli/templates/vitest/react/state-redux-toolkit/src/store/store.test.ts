import { describe, expect, it } from 'vitest';
import { setupStore } from './store.js';
import { increment } from './slices/counterSlice.js';

describe('setupStore', () => {
  it('creates a store with the counter reducer', () => {
    const store = setupStore();
    expect(store.getState().counter.count).toBe(0);
  });

  it('accepts preloaded state', () => {
    const store = setupStore({ counter: { count: 4 } });
    expect(store.getState().counter.count).toBe(4);
  });

  it('dispatches slice actions', () => {
    const store = setupStore();
    store.dispatch(increment());
    expect(store.getState().counter.count).toBe(1);
  });
});
