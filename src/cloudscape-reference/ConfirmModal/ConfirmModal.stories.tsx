// Real RiskSmart ConfirmModal from
// `packages/web/src/components/confirm-modal` — generic confirm dialog
// with primary "Confirm" + "Cancel" buttons. Production uses this for
// non-destructive actions; the destructive equivalent is DeleteModal.
import type { Meta, StoryObj } from '@storybook/react-vite';
// eslint-disable-next-line import/no-unresolved
import ConfirmModal from 'src/components/confirm-modal/ConfirmModal';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
import { useState } from 'react';

import '../_setup';
import { RealProviders } from '../../app-shell/_providers';

const meta = {
  title: 'Cloudscape Reference/ConfirmModal',
  component: ConfirmModal as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real RiskSmart ConfirmModal. 1:1 with live app.' } },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <RealProviders initialPath={'/'}>
    <div style={{ padding: 24 }}>{children}</div>
  </RealProviders>
);

const StateHarness = ({
  defaultOpen = false,
  header,
  body,
}: {
  defaultOpen?: boolean;
  header: string;
  body: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open confirm modal</Button>
      <ConfirmModal
        isVisible={open}
        onConfirm={() => setOpen(false)}
        onDismiss={() => setOpen(false)}
        header={header}
      >
        {body}
      </ConfirmModal>
    </>
  );
};

export const Default: Story = {
  render: () => (
    <Wrap>
      <StateHarness
        defaultOpen
        header={'Submit assessment'}
        body={'Submit this assessment for review? Once submitted, it will be queued for the next QA pass.'}
      />
    </Wrap>
  ),
};

export const DiscardChangesPattern: Story = {
  render: () => (
    <Wrap>
      <StateHarness
        defaultOpen
        header={'Discard changes?'}
        body={'You have unsaved changes. If you leave this page now, your edits will be lost.'}
      />
    </Wrap>
  ),
};

export const WithLongContent: Story = {
  render: () => (
    <Wrap>
      <StateHarness
        defaultOpen
        header={'Confirm bulk update'}
        body={`This action will update 47 risks at once.

The following changes will be applied to every selected risk:

• Severity → Critical
• Status → In review
• Owner → Sarah Chen

Each affected risk will receive an entry in its activity log. Linked controls and ratings remain unchanged. You can review the updates from the dashboard once they're complete.`}
      />
    </Wrap>
  ),
};
