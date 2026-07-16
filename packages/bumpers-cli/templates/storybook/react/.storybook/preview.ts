import { createElement } from 'react';
import type { Preview } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '{{reactStorybookCssImport}}';

const preview: Preview = {
  decorators: [
    (Story) => {
      const queryClient = new QueryClient();
      return createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(Story),
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
