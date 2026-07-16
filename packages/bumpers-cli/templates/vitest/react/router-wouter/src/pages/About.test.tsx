import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import AboutPage from './About.js';
import { renderWithProviders } from '../test-utils.js';

describe('About page', () => {
  it('renders the about heading', () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
  });
});
