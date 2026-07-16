import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Counter from './Counter.js';

describe('Counter', () => {
  it('renders local state', () => {
    render(<Counter />);
    expect(screen.getByTestId('{{reactCounterTestId}}')).toHaveTextContent('0');
  });

  it('increments on click', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await user.click(screen.getByTestId('{{reactCounterIncrementTestId}}'));
    expect(screen.getByTestId('{{reactCounterTestId}}')).toHaveTextContent('1');
  });
});
