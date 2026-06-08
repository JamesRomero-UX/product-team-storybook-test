// Real RiskSmart Loading from `packages/web/src/components/loading`
// — Spinner inside a CSS-module-padded container. Used during Apollo /
// tRPC query loading states across the app.
import type { Meta, StoryObj } from '@storybook/react-vite';
// eslint-disable-next-line import/no-unresolved
import Loading from 'src/components/loading';
import '../_setup';

const meta = {
  title: 'Cloudscape Reference/Loading (web)',
  component: Loading as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Real RiskSmart web Loading. 1:1 with live app.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Loading />,
};

export const InsideContainer: Story = {
  render: () => (
    <div
      style={{
        width: 480,
        height: 320,
        border: '1px solid #e5e5e5',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Loading />
    </div>
  ),
};
