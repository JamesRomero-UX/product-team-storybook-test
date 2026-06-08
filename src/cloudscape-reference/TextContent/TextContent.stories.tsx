import type { Meta, StoryObj } from '@storybook/react-vite';
import TextContent from '@risk-smart/themed-cloudscape-components/text-content';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/TextContent',
  component: TextContent,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real Cloudscape TextContent rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof TextContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TextContent>
      <h1>Heading 1</h1>
      <p>Paragraph with <strong>bold</strong> and <em>italic</em>.</p>
      <ul><li>Item 1</li><li>Item 2</li></ul>
    </TextContent>
  ),
};
