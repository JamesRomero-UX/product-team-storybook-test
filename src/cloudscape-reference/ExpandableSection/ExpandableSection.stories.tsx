import type { Meta, StoryObj } from '@storybook/react-vite';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/ExpandableSection',
  component: ExpandableSection,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape ExpandableSection rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof ExpandableSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { headerText: 'Click to expand', children: 'Hidden content.' } };
export const Variants: Story = {
  render: () => (
    <SpaceBetween size={'s'}>
      <ExpandableSection variant={'default'} headerText={'Default'}>Body</ExpandableSection>
      <ExpandableSection variant={'footer'} headerText={'Footer style'}>Body</ExpandableSection>
      <ExpandableSection variant={'container'} headerText={'Container style'}>Body</ExpandableSection>
    </SpaceBetween>
  ),
};
