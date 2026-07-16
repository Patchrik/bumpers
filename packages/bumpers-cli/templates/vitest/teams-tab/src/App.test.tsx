import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { app } from '@microsoft/teams-js';
import App from './App.js';

vi.mock('@microsoft/teams-js');

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(app.initialize).mockResolvedValue(undefined);
    vi.mocked(app.getContext).mockResolvedValue({
      app: { theme: 'dark', locale: 'fr-fr' },
    } as Awaited<ReturnType<typeof app.getContext>>);
  });

  it('renders the heading with display name', async () => {
    render(<App />);

    expect(
      await screen.findByRole('heading', { level: 1, name: '{{displayName}}' }),
    ).toBeInTheDocument();
  });
});
