import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import App from './App.js';
import { renderWithProviders } from './test-utils.js';

describe('App', () => {
  it('renders a single-page app without navigation links', () => {
    renderWithProviders(<App />);

    expect(screen.getByTestId('{{reactHeadingTestId}}')).toHaveTextContent('{{projectName}}');
    expect(screen.queryByTestId('{{reactNavHomeTestId}}')).not.toBeInTheDocument();
    expect(screen.queryByTestId('{{reactNavAboutTestId}}')).not.toBeInTheDocument();
  });
});
