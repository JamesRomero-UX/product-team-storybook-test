import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Alert, AlertDescription, AlertHeader, AlertTitle } from '../alert';
import { AlertStatus } from '../alert-status';
import { Separator } from '../separator';
import { Box, BoxContent, BoxTitle } from '.';

/**
 * A simple container component that can be used to group related content together.
 * It can optionally include a switch to toggle the visibility of the content.
 */
const meta = {
  title: 'Components/Box',
  component: Box,
  tags: ['wip'],
  subcomponents: {
    BoxTitle,
    BoxContent,
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional tailwind classes to apply to the container',
    },
  },
  render: (args) => (
    <Box {...args}>
      <BoxTitle>{'Title'}</BoxTitle>
      <BoxContent>
        <p className={'text-base text-muted-foreground'}>
          {'Content goes here'}
        </p>
      </BoxContent>
    </Box>
  ),
  decorators: [
    (Story) => (
      <div style={{ minWidth: '600px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleOnly: Story = {
  render: () => (
    <Box>
      <BoxTitle>{'Title only'}</BoxTitle>
    </Box>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <Box>
      <BoxContent>
        <p className={'text-base text-muted-foreground'}>
          {'Content without a title'}
        </p>
      </BoxContent>
    </Box>
  ),
};

export const WithSwitch: Story = {
  render: () => (
    <Box hasSwitch>
      <BoxTitle>{'With switch'}</BoxTitle>
      <BoxContent>
        <p className={'text-base text-muted-foreground'}>
          {'This content is toggled by the switch.'}
        </p>
      </BoxContent>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: /With switch/i });
    const content = canvas.getByText('This content is toggled by the switch.');

    await expect(toggle).not.toBeChecked();
    await expect(content).not.toBeVisible();

    await userEvent.click(toggle);

    await expect(toggle).toBeChecked();
    await waitFor(() => expect(content).toBeVisible());

    await userEvent.click(toggle);

    await expect(toggle).not.toBeChecked();
    await waitFor(() => expect(content).not.toBeVisible());
  },
};

export const WithSwitchDefaultOpen: Story = {
  render: () => (
    <Box hasSwitch defaultOpen>
      <BoxTitle>{'Default open switch'}</BoxTitle>
      <BoxContent>
        <p className={'text-base text-muted-foreground'}>
          {'This content is toggled by the switch.'}
        </p>
      </BoxContent>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', {
      name: /Default open switch/i,
    });
    const content = canvas.getByText('This content is toggled by the switch.');

    await expect(toggle).toBeChecked();
    await expect(content).toBeVisible();
  },
};

export const WithRichContent: Story = {
  render: () => (
    <Box>
      <BoxTitle>{'Rich content'}</BoxTitle>
      <Separator />
      <BoxContent>
        <Alert>
          <AlertStatus />
          <AlertHeader>
            <AlertTitle>{'Some info'}</AlertTitle>
          </AlertHeader>
          <AlertDescription>
            {'Here is some additional information.'}
          </AlertDescription>
        </Alert>
      </BoxContent>
    </Box>
  ),
};
