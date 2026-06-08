import type { Meta, StoryObj } from '@storybook/react-vite';
import BreadcrumbGroup from '@risk-smart/themed-cloudscape-components/breadcrumb-group';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/BreadcrumbGroup',
  component: BreadcrumbGroup,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape BreadcrumbGroup rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof BreadcrumbGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <BreadcrumbGroup items={[
    { text: 'Home', href: '#/' },
    { text: 'Risks', href: '#/risks' },
    { text: 'R-001', href: '#' },
  ]} />,
};
