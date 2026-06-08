import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import { expect, userEvent, within } from 'storybook/test';

import { AlertStatus, Badge, Separator, Switch } from '../../components';
import { cn } from '../../lib/utils';
import {
  SelectableCard,
  SelectableCardAction,
  SelectableCardDescription,
  SelectableCardFooter,
  SelectableCardHeader,
  SelectableCardStatus,
  SelectableCardTitle,
} from './index';

type SelectableCardWithCustomArgs = ComponentProps<typeof SelectableCard> & {
  hasSwitch?: boolean;
};

const meta = {
  title: 'Patterns/SelectableCard',
  component: SelectableCard,
  subcomponents: {
    SelectableCardHeader,
    SelectableCardTitle,
    SelectableCardDescription,
    SelectableCardAction,
    SelectableCardFooter,
    AlertStatus,
    SelectableCardStatus,
  },
  argTypes: {
    enabled: {
      control: 'boolean',
      description: 'Whether the card is checked (toggled on)',
    },
    selected: {
      control: 'boolean',
      description: 'Whether the card is active (blue border)',
    },
    hasSwitch: {
      control: 'boolean',
      description: 'Story Prop: Whether the card has a switch in the footer',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Selectable card pattern with `enabled` (interactivity) and `selected` (visual state). Use in pairs to allow mutual selection.',
      },
    },
  },
  render: () => {
    const [args, updateArgs] = useArgs<SelectableCardWithCustomArgs>();
    const enabled = args.enabled ?? false;
    const selected = args.selected ?? false;
    const hasSwitch = args.hasSwitch ?? true;

    return (
      <SelectableCard
        enabled={enabled}
        selected={selected}
        onClick={() => updateArgs({ selected: !selected })}
      >
        <SelectableCardHeader>
          <SelectableCardTitle>
            {'This is a selectable card title'}
          </SelectableCardTitle>
          <SelectableCardDescription>
            {'This is a selectable card description'}
          </SelectableCardDescription>
          <SelectableCardAction>
            <Badge size={'sm'} variant={enabled ? 'success' : 'muted'}>
              {enabled ? 'READY' : 'OFF'}
            </Badge>
          </SelectableCardAction>
        </SelectableCardHeader>
        <Separator />
        <SelectableCardFooter>
          <AlertStatus variant={enabled ? 'active' : 'inactive'} />
          <SelectableCardStatus>
            {enabled ? 'Active' : 'Inactive'}
          </SelectableCardStatus>
          {hasSwitch ? (
            <Switch
              checked={enabled}
              onCheckedChange={(value) => {
                updateArgs({ enabled: value, selected: value });
              }}
              aria-label={'Toggle selection'}
              size={'lg'}
            />
          ) : null}
        </SelectableCardFooter>
      </SelectableCard>
    );
  },
  args: {
    enabled: false,
    selected: false,
    hasSwitch: true,
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '600px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<SelectableCardWithCustomArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SwitchStory: Story = {
  name: 'Switch',
  render: () => (
    <div className={cn('grid gap-4')}>
      <SelectableCard enabled={false} selected={false}>
        <SelectableCardHeader>
          <SelectableCardTitle>
            {'This is a selectable card title'}
          </SelectableCardTitle>
          <SelectableCardDescription>
            {'This is a selectable card description'}
          </SelectableCardDescription>
          <SelectableCardAction>
            <Badge size={'sm'} variant={'muted'}>
              {'OFF'}
            </Badge>
          </SelectableCardAction>
        </SelectableCardHeader>
        <Separator />
        <SelectableCardFooter>
          <AlertStatus variant={'inactive'} />
          <SelectableCardStatus>{'Inactive'}</SelectableCardStatus>
          <Switch checked={false} aria-label={'Toggle selection'} size={'lg'} />
        </SelectableCardFooter>
      </SelectableCard>
      <SelectableCard enabled={true} selected={false}>
        <SelectableCardHeader>
          <SelectableCardTitle>
            {'This is a selectable card title'}
          </SelectableCardTitle>
          <SelectableCardDescription>
            {'This is a selectable card description'}
          </SelectableCardDescription>
          <SelectableCardAction>
            <Badge size={'sm'} variant={'success'}>
              {'READY'}
            </Badge>
          </SelectableCardAction>
        </SelectableCardHeader>
        <Separator />
        <SelectableCardFooter>
          <AlertStatus variant={'active'} />
          <SelectableCardStatus>{'Active'}</SelectableCardStatus>
          <Switch checked={true} aria-label={'Toggle selection'} size={'lg'} />
        </SelectableCardFooter>
      </SelectableCard>
      <SelectableCard enabled={true} selected={true}>
        <SelectableCardHeader>
          <SelectableCardTitle>
            {'This is selectable card title'}
          </SelectableCardTitle>
          <SelectableCardDescription>
            {'This is selectable card description'}
          </SelectableCardDescription>
          <SelectableCardAction>
            <Badge size={'sm'} variant={'success'}>
              {'READY'}
            </Badge>
          </SelectableCardAction>
        </SelectableCardHeader>
        <Separator />
        <SelectableCardFooter>
          <AlertStatus variant={'active'} />
          <SelectableCardStatus>{'Active'}</SelectableCardStatus>
          <Switch checked={true} aria-label={'Toggle selection'} size={'lg'} />
        </SelectableCardFooter>
      </SelectableCard>
    </div>
  ),
};

export const Static: Story = {
  render: () => (
    <div className={cn('grid gap-4')}>
      <SelectableCard enabled={true} selected={false}>
        <SelectableCardHeader>
          <SelectableCardTitle>
            {'This is a selectable card title'}
          </SelectableCardTitle>
          <SelectableCardDescription>
            {'This is a selectable card description'}
          </SelectableCardDescription>
          <SelectableCardAction>
            <Badge size={'sm'} variant={'success'}>
              {'READY'}
            </Badge>
          </SelectableCardAction>
        </SelectableCardHeader>
        <Separator />
        <SelectableCardFooter>
          <AlertStatus variant={'active'} />
          <SelectableCardStatus>{'Always Active'}</SelectableCardStatus>
        </SelectableCardFooter>
      </SelectableCard>
      <SelectableCard enabled={true} selected={true}>
        <SelectableCardHeader>
          <SelectableCardTitle>
            {'This is selectable card title'}
          </SelectableCardTitle>
          <SelectableCardDescription>
            {'This is selectable card description'}
          </SelectableCardDescription>
          <SelectableCardAction>
            <Badge size={'sm'} variant={'success'}>
              {'READY'}
            </Badge>
          </SelectableCardAction>
        </SelectableCardHeader>
        <Separator />
        <SelectableCardFooter>
          <AlertStatus variant={'active'} />
          <SelectableCardStatus>{'Always Active'}</SelectableCardStatus>
        </SelectableCardFooter>
      </SelectableCard>
    </div>
  ),
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const SelectableCardWithState = () => {
  const [middleEnabled, setMiddleEnabled] = useState<boolean>(true);
  const [bottomEnabled, setBottomEnabled] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<'top' | 'middle' | 'bottom'>(
    'top'
  );

  return (
    <div className={cn('grid gap-4')}>
      <SelectableCard
        enabled={true}
        selected={selectedId === 'top'}
        onClick={() => setSelectedId('top')}
      >
        <SelectableCardHeader>
          <SelectableCardTitle>
            {'This is a selectable card title'}
          </SelectableCardTitle>
          <SelectableCardDescription>
            {'This is a selectable card description'}
          </SelectableCardDescription>
          <SelectableCardAction>
            <Badge size={'sm'} variant={'success'}>
              {'READY'}
            </Badge>
          </SelectableCardAction>
        </SelectableCardHeader>
        <Separator />
        <SelectableCardFooter>
          <AlertStatus variant={'active'} />
          <SelectableCardStatus>{'Always Active'}</SelectableCardStatus>
        </SelectableCardFooter>
      </SelectableCard>
      <SelectableCard
        enabled={true}
        selected={selectedId === 'middle'}
        onClick={() => setSelectedId('middle')}
        onKeyDown={noop}
      >
        <SelectableCardHeader>
          <SelectableCardTitle>
            {'This is a selectable card title'}
          </SelectableCardTitle>
          <SelectableCardDescription>
            {'This is a selectable card description'}
          </SelectableCardDescription>
          <SelectableCardAction>
            <Badge size={'sm'} variant={middleEnabled ? 'success' : 'muted'}>
              {middleEnabled ? 'READY' : 'OFF'}
            </Badge>
          </SelectableCardAction>
        </SelectableCardHeader>
        <Separator />
        <SelectableCardFooter onClick={noop}>
          <AlertStatus variant={middleEnabled ? 'active' : 'inactive'} />
          <SelectableCardStatus>
            {middleEnabled ? 'Active' : 'Inactive'}
          </SelectableCardStatus>
          <Switch
            checked={middleEnabled}
            onCheckedChange={(value) => {
              setMiddleEnabled(value);
              setSelectedId(value ? 'middle' : 'top');
            }}
            aria-label={'Toggle selection'}
            size={'lg'}
          />
        </SelectableCardFooter>
      </SelectableCard>
      <SelectableCard
        enabled={bottomEnabled}
        selected={selectedId === 'bottom'}
        onClick={() => setSelectedId('bottom')}
      >
        <SelectableCardHeader>
          <SelectableCardTitle>
            {'This is another selectable card title'}
          </SelectableCardTitle>
          <SelectableCardDescription>
            {'This is another selectable card description'}
          </SelectableCardDescription>
          <SelectableCardAction>
            <Badge size={'sm'} variant={bottomEnabled ? 'success' : 'muted'}>
              {bottomEnabled ? 'READY' : 'OFF'}
            </Badge>
          </SelectableCardAction>
        </SelectableCardHeader>
        <Separator />
        <SelectableCardFooter>
          <AlertStatus variant={bottomEnabled ? 'active' : 'inactive'} />
          <SelectableCardStatus>
            {bottomEnabled ? 'Active' : 'Inactive'}
          </SelectableCardStatus>
          <Switch
            checked={bottomEnabled}
            onCheckedChange={(value) => {
              setBottomEnabled(value);
              setSelectedId(value ? 'bottom' : 'top');
            }}
            aria-label={'Toggle selection'}
            size={'lg'}
          />
        </SelectableCardFooter>
      </SelectableCard>
    </div>
  );
};

/**
 * Shows a paired setup where selecting one card unselects the other.
 * The top card is always enabled; the bottom card can be enabled via its switch.
 */
export const Interaction: Story = {
  render: () => <SelectableCardWithState />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cards = canvas.getAllByTestId('selectable-card');
    const topCard = cards[0];
    const middleCard = cards[1];
    const bottomCard = cards[2];
    const switches = canvas.getAllByRole('switch');
    const middleSwitch = switches[0];
    const bottomSwitch = switches[1];

    // -- Initial state: top selected, middle enabled, bottom disabled --
    await expect(topCard).toHaveRole('button');
    await expect(middleCard).toHaveRole('button');
    await expect(bottomCard).toHaveAttribute('aria-disabled', 'true');
    await expect(within(bottomCard).getByText('Inactive')).toBeVisible();

    // -- Select middle card via Enter key (covers handleKeyDown lines 22-24) --
    middleCard.focus();
    await userEvent.keyboard('{Enter}');
    await expect(within(middleCard).getByText('Active')).toBeVisible();

    // -- Select top card via click --
    await userEvent.click(topCard);
    await expect(within(topCard).getByText('Always Active')).toBeVisible();

    // -- Select middle card via Space key (covers handleKeyDown line 22) --
    middleCard.focus();
    await userEvent.keyboard(' ');
    await expect(within(middleCard).getByText('Active')).toBeVisible();

    // -- Toggle middle switch off → middle disabled, selection returns to top --
    await userEvent.click(middleSwitch);
    await expect(within(middleCard).getByText('Inactive')).toBeVisible();
    await expect(within(middleCard).getByText('OFF')).toBeVisible();

    // -- Toggle middle switch back on → middle enabled and selected --
    await userEvent.click(middleSwitch);
    await expect(within(middleCard).getByText('Active')).toBeVisible();
    await expect(within(middleCard).getByText('READY')).toBeVisible();

    // -- Toggle bottom switch on → bottom enabled and selected --
    await userEvent.click(bottomSwitch);
    await expect(bottomCard).toHaveRole('button');
    await expect(bottomCard).not.toHaveAttribute('aria-disabled');
    await expect(within(bottomCard).getByText('Active')).toBeVisible();
    await expect(within(bottomCard).getByText('READY')).toBeVisible();

    // -- Toggle bottom switch off → bottom disabled, selection returns to top --
    await userEvent.click(bottomSwitch);
    await expect(bottomCard).toHaveAttribute('aria-disabled', 'true');
    await expect(within(bottomCard).getByText('Inactive')).toBeVisible();
    await expect(within(bottomCard).getByText('OFF')).toBeVisible();
  },
};
