import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { cn, toTitleCase } from '../../lib/utils';
import { Button } from '../button/index';
import { Icon } from '../icon/index';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './index';
import { itemVariant } from './variants';

type Align = ComponentProps<typeof DropdownMenuContent>['align'];
type Side = ComponentProps<typeof DropdownMenuContent>['side'];

/**
 * A dropdown menu displays a list of actions or options that a user can choose from.
 * Built on top of `@base-ui/react` Menu primitives.
 */
const meta = {
  title: 'Components/DropdownMenu',
  component: DropdownMenuItem,
  subcomponents: {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: Object.keys(itemVariant),
      description: 'The visual style of the menu item',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the menu item is disabled',
    },
  },
  args: {
    variant: 'default',
  },
} satisfies Meta<typeof DropdownMenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant={'neutral'}>
            <Icon
              name={'chevron-down'}
              className={
                'transition-transform duration-150 group-data-[popup-open]:rotate-180'
              }
            />
            {'Actions'}
          </Button>
        }
        className={'group'}
      />
      <DropdownMenuContent align={'end'}>
        <DropdownMenuItem {...args}>
          <Icon name={'play'} size={'xs'} />
          {'Start RCSA'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem {...args}>
          <Icon name={'layers-three-01'} size={'xs'} />
          {'Edit tabs'}
        </DropdownMenuItem>
        <DropdownMenuItem {...args}>
          <Icon name={'file-06'} size={'xs'} />
          {'Edit form'}
        </DropdownMenuItem>
        <DropdownMenuItem {...args} variant={'destructive'}>
          <Icon name={'trash-01'} size={'xs'} />
          {'Delete Risk'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem {...args}>
          <Icon name={'download-01'} size={'xs'} />
          {'Export PDF'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Actions/i });

    await expect(trigger).toBeInTheDocument();
    await userEvent.click(trigger);

    const startItem = await screen.findByRole('menuitem', {
      name: /Start RCSA/i,
    });
    await waitFor(() => expect(startItem).toBeInTheDocument());

    const deleteItem = screen.getByRole('menuitem', {
      name: /Delete Risk/i,
    });
    await expect(deleteItem).toBeInTheDocument();

    // -- Verify separators are rendered --
    const separators = screen.getAllByRole('separator');
    await expect(separators.length).toBe(2);

    // -- Test keyboard navigation and closing with Escape key --
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(
        screen.queryByRole('menuitem', { name: /Start RCSA/i })
      ).not.toBeInTheDocument()
    );
  },
};

export const ItemVariants: Story = {
  render: () => (
    <div className={cn('story-tile-group')}>
      {Object.keys(itemVariant).map((variantName) => (
        <div key={variantName} className={cn('story-tile')}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant={'neutral'}>{toTitleCase(variantName)}</Button>
              }
            />
            <DropdownMenuContent>
              <DropdownMenuItem
                variant={variantName as keyof typeof itemVariant}
              >
                <Icon
                  name={
                    variantName === 'destructive' ? 'trash-01' : 'pencil-01'
                  }
                  size={'xs'}
                />
                {toTitleCase(variantName) + ' item'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant={'neutral'}>{'Grouped menu'}</Button>}
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>{'Actions'}</DropdownMenuLabel>
          <DropdownMenuItem>
            <Icon name={'play'} size={'xs'} />
            {'Start RCSA'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{'Edit'}</DropdownMenuLabel>
          <DropdownMenuItem>
            <Icon name={'layers-three-01'} size={'xs'} />
            {'Edit tabs'}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon name={'file-06'} size={'xs'} />
            {'Edit form'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{'Danger zone'}</DropdownMenuLabel>
          <DropdownMenuItem variant={'destructive'}>
            <Icon name={'trash-01'} size={'xs'} />
            {'Delete Risk'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Grouped menu/i });

    await expect(trigger).toBeInTheDocument();

    await userEvent.click(trigger);

    // -- Verify group labels are rendered (DropdownMenuLabel) --
    const actionGroupLabel = await screen.findByText(/Actions/i);
    await waitFor(() => expect(actionGroupLabel).toBeInTheDocument());

    const editGroupLabel = screen.getByText('Edit');
    await expect(editGroupLabel).toBeInTheDocument();

    const dangerGroupLabel = screen.getByText(/Danger zone/i);
    await expect(dangerGroupLabel).toBeInTheDocument();

    // -- Verify groups are rendered (DropdownMenuGroup) --
    const groups = screen.getAllByRole('group');
    await expect(groups.length).toBe(3);

    // -- Verify separators are rendered (DropdownMenuSeparator) --
    const separators = screen.getAllByRole('separator');
    await expect(separators.length).toBe(2);
  },
};

export const ItemsWithoutIcons: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant={'neutral'}>{'Text only'}</Button>}
      />
      <DropdownMenuContent>
        <DropdownMenuItem>{'Start RCSA'}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>{'Edit tabs'}</DropdownMenuItem>
        <DropdownMenuItem>{'Edit form'}</DropdownMenuItem>
        <DropdownMenuItem variant={'destructive'}>
          {'Delete Risk'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>{'Export PDF'}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const DisabledItems: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant={'neutral'}>{'Disabled items'}</Button>}
      />
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Icon name={'play'} size={'xs'} />
          {'Start RCSA'}
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Icon name={'layers-three-01'} size={'xs'} />
          {'Edit tabs'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant={'destructive'} disabled>
          <Icon name={'trash-01'} size={'xs'} />
          {'Delete Risk'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const ContentAlignment: Story = {
  render: () => (
    <div className={cn('story-tile-group gap-[84px] flex flex-col')}>
      {(['start', 'center', 'end'] as Align[]).map((align) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant={'neutral'}>{toTitleCase(align!)}</Button>}
          />
          <DropdownMenuContent align={align}>
            <DropdownMenuItem>
              <Icon name={'play'} size={'xs'} />
              {'Start RCSA'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  ),
};

export const ContentSide: Story = {
  render: () => (
    <div className={cn('story-tile-group')}>
      {(
        [
          'inline-start',
          'left',
          'top',
          'bottom',
          'right',
          'inline-end',
        ] as Side[]
      ).map((side) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant={'neutral'}>{toTitleCase(side!)}</Button>}
          />
          <DropdownMenuContent side={side}>
            <DropdownMenuItem>
              <Icon name={'play'} size={'xs'} />
              {'Start RCSA'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  ),
};

export const IconTrigger: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Icon name={'dots-vertical'} />}
        className={'p-1'}
      />
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Icon name={'play'} size={'xs'} />
          {'Start RCSA'}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icon name={'pencil-01'} size={'xs'} />
          {'Edit tabs'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
