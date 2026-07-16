import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import App from './App.js';
import { renderWithProviders } from './test-utils.js';

describe('App', () => {
  it('renders the home UI', () => {
    renderWithProviders(<App />);

    expect(screen.getByTestId('{{reactHeadingTestId}}')).toHaveTextContent('{{projectName}}');
  });
});
