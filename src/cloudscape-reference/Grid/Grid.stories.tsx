import type { Meta, StoryObj } from '@storybook/react-vite';
import Box from '@risk-smart/themed-cloudscape-components/box';
import Container from '@risk-smart/themed-cloudscape-components/container';
import Grid from '@risk-smart/themed-cloudscape-components/grid';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Grid',
  component: Grid,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape Grid rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Grid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
      <Container><Box>Left</Box></Container>
      <Container><Box>Right</Box></Container>
    </Grid>
  ),
};
