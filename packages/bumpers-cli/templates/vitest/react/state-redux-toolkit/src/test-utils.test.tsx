import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import Counter from './Components/Counter/Counter.js';
import { renderWithProviders } from './test-utils.js';

describe('renderWithProviders', () => {
  it('creates a fresh store and applies preloaded state', () => {
    const { store } = renderWithProviders(<Counter />, {
      preloadedState: {
        counter: { count: 7 },
      },
    });

    expect(store.getState().counter.count).toBe(7);
    expect(screen.getByTestId('{{reactCounterTestId}}')).toHaveTextContent('7');
  });
});
