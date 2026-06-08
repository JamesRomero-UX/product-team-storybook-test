import { Accordion } from '@risksmart-app/atomic-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FormConfiguration } from './index';

const meta = {
  title: 'Blocks/FormConfiguration',
  component: FormConfiguration,
  tags: ['!autodocs', 'wip'],
  args: {
    children: (
      <Accordion multiple defaultValue={[1, 2]}>
        <Accordion.Item value={1}>
          <Accordion.Header>
            <Accordion.Trigger>{'Details'}</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={'h-[100px]'}>{''}</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value={2}>
          <Accordion.Header>
            <Accordion.Trigger>{'Other'}</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={'h-[100px]'}>{''}</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    ),
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof FormConfiguration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
