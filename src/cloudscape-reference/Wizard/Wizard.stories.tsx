import type { Meta, StoryObj } from '@storybook/react-vite';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Input from '@risk-smart/themed-cloudscape-components/input';
import Wizard from '@risk-smart/themed-cloudscape-components/wizard';
import { useState } from 'react';
import '../_setup';


const meta = {
  title: 'Cloudscape Reference/Wizard',
  component: Wizard,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Real Cloudscape Wizard rendered with RiskSmart theme. 1:1 with live app.' } },
  },
} satisfies Meta<typeof Wizard>;

export default meta;

type Story = StoryObj<typeof meta>;

const Demo = () => {
  const [step, setStep] = useState(0);
  return <Wizard
    i18nStrings={{
      stepNumberLabel: (n) => `Step ${n}`,
      collapsedStepsLabel: (n, total) => `Step ${n} of ${total}`,
      cancelButton: 'Cancel',
      previousButton: 'Previous',
      nextButton: 'Next',
      submitButton: 'Submit',
    }}
    activeStepIndex={step}
    onNavigate={({ detail }) => setStep(detail.requestedStepIndex)}
    onSubmit={() => alert('Submit')}
    steps={[
      { title: 'Identify the risk', content: <FormField label={'Risk name'}><Input value={''} onChange={() => {}} /></FormField> },
      { title: 'Assess impact', content: <FormField label={'Impact'}><Input value={''} onChange={() => {}} /></FormField> },
      { title: 'Mitigate', content: <FormField label={'Mitigation'}><Input value={''} onChange={() => {}} /></FormField> },
      { title: 'Review', content: <p>Review and submit.</p> },
    ]} />;
};
export const Default: Story = { render: () => <Demo /> };
