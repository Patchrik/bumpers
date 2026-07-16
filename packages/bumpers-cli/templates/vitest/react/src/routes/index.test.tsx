import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils.js';

describe('Home page', () => {
  it('renders heading with project name', async () => {
    renderWithProviders(null, { initialRoute: '/' });
    expect(await screen.findByTestId('{{reactHeadingTestId}}')).toHaveTextContent('{{projectName}}');
  });
});
