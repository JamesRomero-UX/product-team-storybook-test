import { Box, cn } from '@risksmart-app/atomic-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { ObligationChangeDetailsProps } from './index';
import { ObligationChangeDetails } from './index';

const meta = {
  title: 'Blocks/ObligationChangeDetails',
  component: ObligationChangeDetails,
  tags: ['!autodocs'],
  args: {
    lang: {
      cards: {
        details: 'Details',
        current: 'Current',
        upcoming: 'Upcoming',
      },
      status: {
        unread: 'Unread',
        read: 'Read',
      },
      details: {
        status: 'Status',
        effectiveDate: 'Effective date',
        regulatoryBody: 'Regulatory body',
        referenceCode: 'Reference code',
        tags: 'Tags',
      },
    },
    state: {
      currentDescription:
        "Principles 3 (Management and control), 4 (Financial prudence) and (in so far as it relates to these principles) Principle 11 (Relations with regulators) take into account the activities of members of a firm's group. This does not mean that compliance by other group members will automatically lead to the firm contravening Principle 3 or 4.",
      currentVersion: 'Version 2.0.0',
      upcomingDescription:
        "Principles 3 (Management and control), 4 (Financial prudence) and (in so far as it relates to these principles) Principle 11 (Relations with regulators) take into account the activities of members of a firm's group.",
      upcomingVersion: 'Version 2.1.0',
      effectiveDate: '23 June 2028',
      status: 'unread',
      regulatoryBody: 'FCA',
      referenceCode: 'PRIN 2.1.1.8',
      tags: ['FCA', 'Principles', 'Management and control'],
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ObligationChangeDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

const ObligationChangeDetailsWithHooks = (
  args: ObligationChangeDetailsProps
) => {
  const state = {
    ...args.state,
  };

  return (
    <Box className={cn('m-6 p-6')}>
      <ObligationChangeDetails {...args} state={state} />
    </Box>
  );
};

export const Default: Story = {
  render: (args) => <ObligationChangeDetailsWithHooks {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText(args.state.currentVersion!)).toBeVisible();
    await expect(canvas.getByText(args.state.upcomingVersion!)).toBeVisible();

    // status is 'unread' — warning badge should be shown
    await expect(canvas.getByText(args.lang.status.unread)).toBeVisible();

    // tags should be rendered joined
    await expect(
      canvas.getByText('FCA, Principles, Management and control')
    ).toBeVisible();
  },
};

export const ReadStatus: Story = {
  args: {
    state: {
      currentDescription: 'Current description text.',
      currentVersion: 'Version 1.0.0',
      upcomingDescription: 'Upcoming description text.',
      upcomingVersion: 'Version 1.1.0',
      effectiveDate: '1 January 2027',
      status: 'read',
      regulatoryBody: 'PRA',
      referenceCode: 'PRA 1.2.3',
      tags: ['PRA'],
    },
  },
  render: (args) => <ObligationChangeDetailsWithHooks {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // status is 'read' — success badge should be shown, not warning
    await expect(canvas.getByText(args.lang.status.read)).toBeVisible();
  },
};

export const NoTags: Story = {
  args: {
    state: {
      currentDescription: 'Current description text.',
      currentVersion: 'Version 3.0.0',
      upcomingDescription: 'Upcoming description text.',
      upcomingVersion: 'Version 3.1.0',
      effectiveDate: '15 March 2029',
      status: 'unread',
      regulatoryBody: 'FCA',
      referenceCode: 'PRIN 5.6.7',
      tags: undefined,
    },
  },
  render: (args) => <ObligationChangeDetailsWithHooks {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText(args.state.currentVersion!)).toBeVisible();

    // tags label is still present even with no tag values
    await expect(canvas.getByText(`${args.lang.details.tags}:`)).toBeVisible();
  },
};

export const NoCurrent: Story = {
  render: (args) => <ObligationChangeDetailsWithHooks {...args} />,
  args: {
    state: {
      currentDescription: undefined,
      currentVersion: undefined,
      upcomingDescription:
        "Principles 3 (Management and control), 4 (Financial prudence) and (in so far as it relates to these principles) Principle 11 (Relations with regulators) take into account the activities of members of a firm's group.",
      upcomingVersion: 'Version 2.1.0',
      effectiveDate: '23 June 2028',
      status: 'unread',
      regulatoryBody: 'FCA',
      referenceCode: 'PRIN 2.1.1.8',
      tags: ['FCA', 'Principles', 'Management and control'],
    },
  },
};
