import { useEffect, useState } from 'react';
import { app } from '@microsoft/teams-js';

interface TeamsContext {
  theme: string;
  locale: string;
}

export default function TeamsContextPanel() {
  const [context, setContext] = useState<TeamsContext | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    app
      .initialize()
      .then(() => {
        setInitialized(true);
        return app.getContext();
      })
      .then((ctx) => {
        setContext({
          theme: ctx.app.theme ?? 'default',
          locale: ctx.app.locale ?? 'en-us',
        });
      })
      .catch(() => {
        // Not running inside Teams, so show standalone mode.
        setInitialized(true);
      });
  }, []);

  if (initialized && context) {
    return (
      <p data-testid="{{teamsContextTestId}}">
        Theme: {context.theme} | Locale: {context.locale}
      </p>
    );
  }

  if (initialized) {
    return (
      <p data-testid="{{teamsContextTestId}}">
        Running in standalone mode (outside Teams)
      </p>
    );
  }

  return null;
}
