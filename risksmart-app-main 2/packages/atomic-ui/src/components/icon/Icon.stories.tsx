import type { Meta, StoryObj } from '@storybook/react-vite';

import { cn } from '../../lib/utils';
import type { IconName } from './iconMap';
import { commonIcons } from './iconMap';
import { Icon } from './index';
import { size, variant } from './variants';

/**
 * An SVG icon component to display various icons
 */
const meta = {
  title: 'Components/Icon',
  component: Icon,
  argTypes: {
    name: {
      control: 'select',
      options: commonIcons,
      description: 'The icon SVG to use',
    },
    variant: {
      control: 'select',
      options: Object.keys(variant),
      description: 'The pre-configured icon style to apply',
    },
    size: {
      control: 'select',
      options: Object.keys(size),
      description: 'The size of the icon',
    },
  },
  args: {
    name: 'activity',
    variant: 'primary',
    size: 'md',
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'activity',
  },
};

export const Variants: Story = {
  args: {
    ...Default.args,
  },
  render: ({ name }) => (
    <div className={cn('flex gap-[48px]')}>
      <table>
        <thead>
          <tr>
            <th
              className={
                'text-base font-medium text-muted-foreground text-right p-2'
              }
            />
            {Object.keys(size).map((sizeName) => (
              <th
                key={sizeName}
                className={
                  'text-base font-medium text-muted-foreground text-center p-2'
                }
              >
                {sizeName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(variant).map((variantName) => (
            <tr key={variantName}>
              <td
                className={
                  'text-base font-medium text-muted-foreground text-left p-2'
                }
              >
                {variantName}
              </td>
              {Object.keys(size).map((sizeName) => (
                <td key={sizeName} className={'text-center p-2'}>
                  <Icon
                    name={name}
                    variant={variantName as keyof typeof variant}
                    size={sizeName as keyof typeof size}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

/**
 * A story to display a selection of commonly used icons in the design system, along with their corresponding names for easy reference when selecting icons for use in designs or development.
 */
export const CommonIcons: Story = {
  render: ({ ...args }) => (
    <div className={cn('grid grid-cols-6 gap-12')}>
      {commonIcons.map((iconName) => (
        <div className={'flex flex-col items-center gap-4'}>
          <Icon {...args} name={iconName as IconName} />
          <div className={'text-base text-center text-foreground'}>
            {iconName}
          </div>
        </div>
      ))}
    </div>
  ),
};
