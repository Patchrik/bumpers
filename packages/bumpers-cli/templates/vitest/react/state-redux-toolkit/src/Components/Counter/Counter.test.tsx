import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Counter from './Counter.js';
import { renderWithProviders } from '../../../test-utils.js';

describe('Counter', () => {
  it('reads the preloaded count from the Redux store', () => {
    renderWithProviders(<Counter />, {
      preloadedState: {
        counter: { count: 3 },
      },
    });

    expect(screen.getByTestId('{{reactCounterTestId}}')).toHaveTextContent('3');
  });

  it('increments on click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Counter />);
    await user.click(screen.getByTestId('{{reactCounterIncrementTestId}}'));
    expect(screen.getByTestId('{{reactCounterTestId}}')).toHaveTextContent('1');
  });
});
