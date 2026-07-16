import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils.js';

describe('About page', () => {
  it('renders about heading', async () => {
    renderWithProviders(null, { initialRoute: '/about' });
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('About');
  });
});
