import type { Meta, StoryObj } from '@storybook/react-vite';
import Link from '@risk-smart/themed-cloudscape-components/link';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Link',
  component: Link,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape Link rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { href: '#', children: 'Default link' } };
export const Variants: Story = {
  render: () => (
    <SpaceBetween size={'s'}>
      <Link href={'#'}>Default link</Link>
      <Link href={'#'} variant={'primary'}>Primary link</Link>
      <Link href={'#'} variant={'info'}>Info link</Link>
      <Link href={'https://example.com'} external>External link</Link>
    </SpaceBetween>
  ),
};
