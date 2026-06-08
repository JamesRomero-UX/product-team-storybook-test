// Real RiskSmart TabHeader from `packages/web/src/components/tab-header`
// — wraps Cloudscape Header with RiskSmart's CSS-module styling. Used at
// the top of every tab section on detail pages.
import type { Meta, StoryObj } from '@storybook/react-vite';
import Button from '@risk-smart/themed-cloudscape-components/button';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';
import '../_setup';

const meta = {
  title: 'Cloudscape Reference/TabHeader',
  component: TabHeader as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Real RiskSmart TabHeader. 1:1 with live app.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {
  render: () => <TabHeader>Risk details</TabHeader>,
};

export const WithCounter: Story = {
  render: () => <TabHeader counter={'(12)'}>Linked controls</TabHeader>,
};

export const WithDescription: Story = {
  render: () => (
    <TabHeader description={'All controls linked to this risk, including their effectiveness and last-reviewed date.'}>
      Linked controls
    </TabHeader>
  ),
};

export const WithActions: Story = {
  render: () => (
    <TabHeader
      counter={'(3)'}
      description={'All controls linked to this risk.'}
      actions={
        <SpaceBetween size={'xs'} direction={'horizontal'}>
          <Button>Export</Button>
          <Button variant={'primary'}>Link control</Button>
        </SpaceBetween>
      }
    >
      Linked controls
    </TabHeader>
  ),
};

export const VariantH3: Story = {
  render: () => (
    <TabHeader variant={'h3'} headingTagOverride={'h3'}>
      Smaller subsection header
    </TabHeader>
  ),
};
