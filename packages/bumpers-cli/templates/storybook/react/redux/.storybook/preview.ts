import { createElement } from 'react';
import type { Preview } from '@storybook/react';
import { Provider } from 'react-redux';
import { store } from '../src/store/store.js';
import '{{reactStorybookCssImport}}';

const preview: Preview = {
  decorators: [
    (Story) =>
      createElement(
        Provider,
        { store },
        createElement(Story),
      ),
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
