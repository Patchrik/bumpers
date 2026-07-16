import type { Meta, StoryObj } from '@storybook/react';
import Counter from './Counter';

const meta: Meta<typeof Counter> = {
  component: Counter,
  title: 'Counter',
};

export default meta;
type Story = StoryObj<typeof Counter>;

export const Default: Story = {};
