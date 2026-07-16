import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.js';
import { renderWithProviders } from './test-utils.js';

describe('App', () => {
  it('navigates to the about page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);

    await user.click(screen.getByTestId('{{reactNavAboutTestId}}'));

    expect(await screen.findByRole('heading', { name: 'About' })).toBeInTheDocument();
  });
});
