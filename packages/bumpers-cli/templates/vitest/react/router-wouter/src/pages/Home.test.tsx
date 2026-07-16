import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import HomePage from './Home.js';
import { renderWithProviders } from '../test-utils.js';

describe('Home page', () => {
  it('renders the project heading', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByTestId('{{reactHeadingTestId}}')).toHaveTextContent('{{projectName}}');
  });
});
