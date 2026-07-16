import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils.js';

describe('Root layout', () => {
  it('renders navigation links', async () => {
    renderWithProviders(null);
    expect(await screen.findByTestId('{{reactNavHomeTestId}}')).toBeInTheDocument();
    expect(screen.getByTestId('{{reactNavAboutTestId}}')).toBeInTheDocument();
  });
});
