import type { Meta, StoryObj } from '@storybook/react-vite';
import Container from '@risk-smart/themed-cloudscape-components/container';
import ContentLayout from '@risk-smart/themed-cloudscape-components/content-layout';
import Header from '@risk-smart/themed-cloudscape-components/header';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/ContentLayout',
  component: ContentLayout,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape ContentLayout rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof ContentLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ContentLayout header={<Header variant={'h1'} description={'Description'}>Page title</Header>}>
      <Container>Body</Container>
    </ContentLayout>
  ),
};
