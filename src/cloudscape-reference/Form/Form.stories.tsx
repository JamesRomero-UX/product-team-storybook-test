import type { Meta, StoryObj } from '@storybook/react-vite';
import Button from '@risk-smart/themed-cloudscape-components/button';
import Form from '@risk-smart/themed-cloudscape-components/form';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Input from '@risk-smart/themed-cloudscape-components/input';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Form',
  component: Form,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape Form rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Form>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Form actions={<Button variant={'primary'}>Submit</Button>}>
      <SpaceBetween size={'l'}>
        <FormField label={'Name'}><Input value={''} onChange={() => {}} /></FormField>
        <FormField label={'Email'}><Input value={''} onChange={() => {}} /></FormField>
      </SpaceBetween>
    </Form>
  ),
};
