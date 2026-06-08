import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  RatingsAccordion,
  RatingsAccordionContent,
  RatingsAccordionItem,
  RatingsAccordionTrigger,
} from './index';

const meta = {
  title: 'Patterns/RatingsAccordion',
  component: RatingsAccordion,
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional tailwind classes to apply to the accordion',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RatingsAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RatingsAccordion defaultValue={['one']}>
      <RatingsAccordionItem value={'one'}>
        <RatingsAccordionTrigger
          title={'Likelihood Levels'}
          itemCount={5}
          isComplete={true}
          description={'Define probabilities for the impact-likelihood matrix'}
        />
        <RatingsAccordionContent className={'h-[100px]'}>
          {''}
        </RatingsAccordionContent>
      </RatingsAccordionItem>
      <RatingsAccordionItem value={'two'}>
        <RatingsAccordionTrigger
          title={'Impact Level Configuration'}
          itemCount={1}
          description={'Define severity levels for impact assessment'}
        />
        <RatingsAccordionContent className={'h-[100px]'}>
          {''}
        </RatingsAccordionContent>
      </RatingsAccordionItem>
      <RatingsAccordionItem value={'three'}>
        <RatingsAccordionTrigger
          title={'Risk Matrix Configuration'}
          description={
            'Define risk ratings for each impact-likelihood combination'
          }
        />
        <RatingsAccordionContent className={'h-[100px]'}>
          {''}
        </RatingsAccordionContent>
      </RatingsAccordionItem>
    </RatingsAccordion>
  ),
};
