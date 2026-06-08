import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { DropdownMenuItem, Icon } from '../../components';
import { ObjectLevelHeader } from './index';

/**
 * A object-level header bar with a title, optional add/save/cancel actions,
 * and an optional kebab menu for additional actions.
 */
const meta = {
  title: 'Patterns/ObjectLevelHeader',
  component: ObjectLevelHeader,
  tags: ['wip'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The object title displayed in the header',
    },
    counter: {
      control: 'number',
      description: 'Optional count displayed next to the title',
    },
    isObjectDirty: {
      control: 'boolean',
      description: 'Indicates if the object has unsaved changes',
    },
  },
  args: {
    title: 'Example Risk',
    onAdd: fn(),
    onSave: fn(),
    onCancel: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '600px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ObjectLevelHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    menuContent: (
      <>
        <DropdownMenuItem>
          <Icon name={'play'} size={'sm'} />
          {'Start RCSA'}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icon name={'pencil-01'} size={'sm'} />
          {'Edit tabs'}
        </DropdownMenuItem>
        <DropdownMenuItem variant={'destructive'}>
          <Icon name={'trash-01'} size={'sm'} />
          {'Delete Risk'}
        </DropdownMenuItem>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Example Risk')).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: /Save/i })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: /Cancel/i })
    ).toBeInTheDocument();

    const menuTrigger = canvas.getByRole('button', {
      name: /More options/i,
    });
    await userEvent.click(menuTrigger);

    const deleteItem = await screen.findByRole('menuitem', {
      name: /Delete Risk/i,
    });
    await waitFor(() => expect(deleteItem).toBeInTheDocument());

    await userEvent.keyboard('{Escape}');
  },
};

export const WithoutMenu: Story = {
  args: {
    menuContent: undefined,
  },
};

export const TitleOnly: Story = {
  args: {
    onAdd: undefined,
    onSave: undefined,
    onCancel: undefined,
    menuContent: undefined,
  },
};

export const WithCounter: Story = {
  args: {
    counter: 12,
    menuContent: (
      <DropdownMenuItem>
        <Icon name={'pencil-01'} size={'sm'} />
        {'Edit'}
      </DropdownMenuItem>
    ),
  },
};

export const WithAdditionalActions: Story = {
  args: {
    additionalActions: [
      {
        label: 'Start RCSA',
        iconName: 'play',
        onClick: fn(),
      },
      {
        label: 'Delete risk',
        iconName: 'trash-01',
        onClick: fn(),
        variant: 'destructive',
        style: 'ghost',
      },
    ],
  },
};

export const WithChanges: Story = {
  args: {
    isObjectDirty: true,
    menuContent: (
      <DropdownMenuItem>
        <Icon name={'pencil-01'} size={'sm'} />
        {'Edit'}
      </DropdownMenuItem>
    ),
  },
};
