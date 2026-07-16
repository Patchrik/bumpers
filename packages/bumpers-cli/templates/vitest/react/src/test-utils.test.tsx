import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import Counter from './Components/Counter/Counter.js';
import { renderWithProviders } from './test-utils.js';

describe('renderWithProviders', () => {
  it('renders wrapped components', () => {
    renderWithProviders(<Counter />);
    expect(screen.getByTestId('{{reactCounterTestId}}')).toHaveTextContent('0');
  });
});
