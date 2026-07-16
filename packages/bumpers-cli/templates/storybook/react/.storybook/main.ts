import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['{{reactStorybookStoriesGlob}}'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  addons: ['@storybook/addon-essentials'],
};

export default config;
