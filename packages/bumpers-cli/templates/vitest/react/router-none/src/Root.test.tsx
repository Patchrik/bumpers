import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import Root from './Root.js';
import { renderWithProviders } from './test-utils.js';

describe('Root', () => {
  it('renders the app shell', () => {
    renderWithProviders(<Root />);

    expect(screen.getByTestId('{{reactHeadingTestId}}')).toHaveTextContent('{{projectName}}');
  });
});
