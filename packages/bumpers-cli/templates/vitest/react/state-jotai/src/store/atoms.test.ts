import { createStore } from 'jotai';
import { describe, expect, it } from 'vitest';
import { counterAtom } from './atoms.js';

describe('counterAtom', () => {
  it('starts at zero', () => {
    const store = createStore();
    expect(store.get(counterAtom)).toBe(0);
  });

  it('can be updated independently per store', () => {
    const store = createStore();
    store.set(counterAtom, 2);
    expect(store.get(counterAtom)).toBe(2);
  });
});
