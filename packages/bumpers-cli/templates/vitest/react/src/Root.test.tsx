import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils.js';

describe('Root', () => {
  it('renders the router root', async () => {
    renderWithProviders(null, { initialRoute: '/' });

    expect(await screen.findByTestId('{{reactHeadingTestId}}')).toHaveTextContent('{{projectName}}');
  });
});
