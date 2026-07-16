import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { app } from '@microsoft/teams-js';
import TeamsContextPanel from './TeamsContextPanel.js';

vi.mock('@microsoft/teams-js');

type TeamsContextResult = Awaited<ReturnType<typeof app.getContext>>;

function teamsContext(values: { theme?: string; locale?: string }): TeamsContextResult {
  return {
    app: {
      theme: values.theme,
      locale: values.locale,
    },
  } as TeamsContextResult;
}

describe('TeamsContextPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(app.initialize).mockResolvedValue(undefined);
    vi.mocked(app.getContext).mockResolvedValue(teamsContext({ theme: 'dark', locale: 'fr-fr' }));
  });

  it('shows Teams context values', async () => {
    render(<TeamsContextPanel />);

    expect(await screen.findByTestId('{{teamsContextTestId}}')).toHaveTextContent('Theme: dark | Locale: fr-fr');
  });

  it('uses default Teams context values', async () => {
    vi.mocked(app.getContext).mockResolvedValueOnce(teamsContext({}));

    render(<TeamsContextPanel />);

    expect(await screen.findByTestId('{{teamsContextTestId}}')).toHaveTextContent('Theme: default | Locale: en-us');
  });

  it('shows standalone mode when Teams initialization fails', async () => {
    vi.mocked(app.initialize).mockRejectedValueOnce(new Error('outside Teams'));

    render(<TeamsContextPanel />);

    expect(await screen.findByTestId('{{teamsContextTestId}}')).toHaveTextContent(
      'Running in standalone mode (outside Teams)',
    );
    expect(app.getContext).not.toHaveBeenCalled();
  });
});
