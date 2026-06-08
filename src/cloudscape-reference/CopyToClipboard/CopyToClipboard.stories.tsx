import type { Meta, StoryObj } from '@storybook/react-vite';
import CopyToClipboard from '@risk-smart/themed-cloudscape-components/copy-to-clipboard';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/CopyToClipboard',
  component: CopyToClipboard,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape CopyToClipboard rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof CopyToClipboard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <CopyToClipboard textToCopy={'arn:aws:iam::123456789012:role/risk-admin'} copyButtonText={'Copy ARN'}
    copySuccessText={'Copied'} copyErrorText={'Copy failed'} />,
};
