// Real RiskSmart Loading from `packages/components/src/loading` — the
// cross-package Loading variant (accepts an optional `testId`).
import type { Meta, StoryObj } from '@storybook/react-vite';
// eslint-disable-next-line import/no-unresolved
import Loading from '@risksmart-app/components/src/loading';
import '../_setup';

const meta = {
  title: 'Cloudscape Reference/Loading (components)',
  component: Loading as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Real RiskSmart cross-app Loading. 1:1 with live app.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Loading />,
};

export const WithTestId: Story = {
  render: () => <Loading testId={'my-custom-loader'} />,
};
