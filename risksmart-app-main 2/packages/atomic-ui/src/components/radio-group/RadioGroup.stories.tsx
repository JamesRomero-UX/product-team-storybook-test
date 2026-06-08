import type { Meta, StoryObj } from '@storybook/react-vite';

import { RadioGroup, RadioItem } from '.';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['new'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className={'story-tile-group'}>
      <div className={'story-tile'}>
        <RadioGroup defaultValue={'option-1'}>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'option-1'} />
            {'Option 1'}
          </label>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'option-2'} />
            {'Option 2'}
          </label>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'option-3'} />
            {'Option 3'}
          </label>
        </RadioGroup>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className={'story-tile-group'}>
      <div className={'story-tile'}>
        <p className={'text-sm font-medium mb-2'}>{'Small'}</p>
        <RadioGroup defaultValue={'a'}>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'a'} size={'sm'} />
            {'Small radio'}
          </label>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'b'} size={'sm'} />
            {'Small radio'}
          </label>
        </RadioGroup>
      </div>
      <div className={'story-tile'}>
        <p className={'text-sm font-medium mb-2'}>{'Medium'}</p>
        <RadioGroup defaultValue={'a'}>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'a'} size={'md'} />
            {'Medium radio'}
          </label>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'b'} size={'md'} />
            {'Medium radio'}
          </label>
        </RadioGroup>
      </div>
      <div className={'story-tile'}>
        <p className={'text-sm font-medium mb-2'}>{'Large'}</p>
        <RadioGroup defaultValue={'a'}>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'a'} size={'lg'} />
            {'Large radio'}
          </label>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'b'} size={'lg'} />
            {'Large radio'}
          </label>
        </RadioGroup>
      </div>
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div className={'story-tile-group'}>
      <div className={'story-tile'}>
        <RadioGroup defaultValue={'a'} orientation={'horizontal'}>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'a'} />
            {'Option A'}
          </label>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'b'} />
            {'Option B'}
          </label>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'c'} />
            {'Option C'}
          </label>
        </RadioGroup>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className={'story-tile-group'}>
      <div className={'story-tile'}>
        <RadioGroup defaultValue={'a'} disabled>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'a'} />
            {'Disabled selected'}
          </label>
          <label className={'flex items-center gap-2 text-sm cursor-pointer'}>
            <RadioItem value={'b'} />
            {'Disabled unselected'}
          </label>
        </RadioGroup>
      </div>
    </div>
  ),
};
