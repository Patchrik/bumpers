import { describe, expect, it } from 'vitest';
import { counterReducer, decrement, increment, reset } from './counterSlice.js';

describe('counterSlice', () => {
  it('starts at zero', () => {
    expect(counterReducer(undefined, { type: 'unknown' }).count).toBe(0);
  });

  it('increments and decrements', () => {
    const incremented = counterReducer({ count: 0 }, increment());
    const decremented = counterReducer(incremented, decrement());
    expect(incremented.count).toBe(1);
    expect(decremented.count).toBe(0);
  });

  it('resets to zero', () => {
    expect(counterReducer({ count: 9 }, reset()).count).toBe(0);
  });
});
