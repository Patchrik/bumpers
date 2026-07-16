import { beforeEach, describe, expect, it } from 'vitest';
import { useCounterStore } from './counter.js';

beforeEach(() => {
  useCounterStore.setState({ count: 0 });
});

describe('counter store', () => {
  it('starts at zero', () => {
    expect(useCounterStore.getState().count).toBe(0);
  });

  it('increments', () => {
    useCounterStore.getState().increment();
    expect(useCounterStore.getState().count).toBe(1);
  });

  it('decrements', () => {
    useCounterStore.getState().increment();
    useCounterStore.getState().decrement();
    expect(useCounterStore.getState().count).toBe(0);
  });

  it('resets', () => {
    useCounterStore.getState().increment();
    useCounterStore.getState().increment();
    useCounterStore.getState().reset();
    expect(useCounterStore.getState().count).toBe(0);
  });
});
