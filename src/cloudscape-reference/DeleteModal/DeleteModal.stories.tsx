// Real RiskSmart DeleteModal from
// `packages/web/src/components/delete-modal` — Cloudscape Modal with a
// destructive primary action (`DeleteButton`, styled red) plus a Cancel.
// Uses the production `confirmDelete` / `cancel` translation strings
// from common.json.
import type { Meta, StoryObj } from '@storybook/react-vite';
// eslint-disable-next-line import/no-unresolved
import DeleteModal from 'src/components/delete-modal';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
import { useState } from 'react';

import '../_setup';
import { RealProviders } from '../../app-shell/_providers';

const meta = {
  title: 'Cloudscape Reference/DeleteModal',
  component: DeleteModal as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Real RiskSmart DeleteModal. 1:1 with live app.' } },
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
      <Button variant={'primary'} onClick={() => setOpen(true)}>
        Open delete modal
      </Button>
      <DeleteModal
        isVisible={open}
        onDelete={() => {}}
        onDismiss={() => setOpen(false)}
        header={header}
        size={'small'}
      >
        {body}
      </DeleteModal>
    </>
  );
};

export const Closed: Story = {
  render: () => (
    <Wrap>
      <StateHarness
        header={'Delete risk'}
        body={'Are you sure you want to delete this risk? This action cannot be undone.'}
      />
    </Wrap>
  ),
};

export const Open: Story = {
  render: () => (
    <Wrap>
      <StateHarness
        defaultOpen
        header={'Delete risk'}
        body={
          'Are you sure you want to delete "Data breach via legacy S3 bucket"? This will remove the risk and all linked controls. This action cannot be undone.'
        }
      />
    </Wrap>
  ),
};

export const WithLongContent: Story = {
  render: () => (
    <Wrap>
      <StateHarness
        defaultOpen
        header={'Delete this set of risks?'}
        body={`This action will permanently delete the following risks:

• R-001 — Data breach via legacy S3 bucket
• R-002 — Vendor SLA miss — payment processor
• R-003 — Phishing susceptibility — finance team
• R-004 — Badge duplication in HQ
• R-005 — Outdated dependency in checkout flow

All linked controls, ratings, and activity history will also be removed. This action cannot be undone — exports of these records made before the delete will remain available in your file storage but will no longer be accessible from the platform UI.`}
      />
    </Wrap>
  ),
};
