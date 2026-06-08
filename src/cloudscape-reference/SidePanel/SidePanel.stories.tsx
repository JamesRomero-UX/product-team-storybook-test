// Real RiskSmart SidePanel from
// `packages/web/src/components/side-panel` — reads `content` from the
// `useSidePanelStore` zustand store and renders it. The store is normally
// driven by the page (via `open(key, content, ...)`), opening a
// right-side drawer inside AppLayout. For Storybook we drive the store
// directly from a `useEffect` in the story.
import type { Meta, StoryObj } from '@storybook/react-vite';
import Box from '@risk-smart/themed-cloudscape-components/box';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Header from '@risk-smart/themed-cloudscape-components/header';
import Input from '@risk-smart/themed-cloudscape-components/input';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
// eslint-disable-next-line import/no-unresolved
import Button from '@risksmart-app/components/src/button';
// eslint-disable-next-line import/no-unresolved
import { SidePanel } from 'src/components/side-panel/SidePanel';
// eslint-disable-next-line import/no-unresolved
import { SidePanelContainer } from 'src/components/side-panel/SidePanelContainer';
// eslint-disable-next-line import/no-unresolved
import { useSidePanelStore } from 'src/components/side-panel/useSidePanelStore';
import { useEffect } from 'react';

import '../_setup';
import { RealProviders } from '../../app-shell/_providers';

const meta = {
  title: 'Cloudscape Reference/SidePanel',
  component: SidePanel as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Real RiskSmart SidePanel + SidePanelContainer. 1:1 with live app. The drawer chrome is driven by useSidePanelStore — call `open(key, content, ...)` to populate.',
      },
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

const PanelStage = ({
  open: shouldOpen = false,
  panel,
}: {
  open?: boolean;
  panel?: React.ReactNode;
}) => {
  const open = useSidePanelStore((s) => s.open);
  const close = useSidePanelStore((s) => s.close);
  useEffect(() => {
    if (shouldOpen && panel) {
      open('chat', panel, false, false);
    } else {
      close();
    }
    return () => close();
  }, [shouldOpen, panel, open, close]);
  return (
    <RealProviders initialPath={'/risks/R-001'}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', height: 600, gap: 16, padding: 16, background: '#f9f9fd' }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e5e5e5' }}>
          <Header>Risk details</Header>
          <Box>This is the main page content. The SidePanel renders to the right when content is pushed into the store.</Box>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', overflow: 'hidden' }}>
          <SidePanel />
        </div>
      </div>
    </RealProviders>
  );
};

export const Closed: Story = {
  render: () => <PanelStage open={false} />,
};

export const Open: Story = {
  render: () => (
    <PanelStage
      open
      panel={
        <SidePanelContainer
          header={
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e9ebed', fontWeight: 600 }}>
              Notes for R-001
            </div>
          }
          content={
            <div style={{ padding: 20 }}>
              <SpaceBetween size={'m'}>
                <Box>This panel slides in from the right when the user clicks "Notes" or any drawer-trigger action on the page.</Box>
                <Box variant={'small'}>Try resizing the window — the panel chrome adapts.</Box>
                <Button>Add a note</Button>
              </SpaceBetween>
            </div>
          }
        />
      }
    />
  ),
};

export const WithForm: Story = {
  render: () => (
    <PanelStage
      open
      panel={
        <SidePanelContainer
          header={
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e9ebed', fontWeight: 600 }}>
              Edit risk
            </div>
          }
          content={
            <div style={{ padding: 20 }}>
              <SpaceBetween size={'l'}>
                <FormField label={'Title'}>
                  <Input value={'Data breach via legacy S3 bucket'} onChange={() => {}} />
                </FormField>
                <FormField label={'Description'}>
                  <Textarea
                    value={'Unrestricted S3 bucket containing legacy customer data was discovered during quarterly audit.'}
                    onChange={() => {}}
                    rows={4}
                  />
                </FormField>
                <SpaceBetween size={'xs'} direction={'horizontal'}>
                  <Button>Cancel</Button>
                  <Button variant={'primary'}>Save</Button>
                </SpaceBetween>
              </SpaceBetween>
            </div>
          }
        />
      }
    />
  ),
};
