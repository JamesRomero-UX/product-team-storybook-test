// Real RiskSmart notification system from
// `packages/components/src/notifications` — `useNotifications().addNotification(...)`
// triggers a toast rendered by `<Toaster />` in `<NotificationProvider>`. The
// banner styling and animation come from
// `packages/components/src/notification-banner/NotificationBanner.tsx`.
//
// `<NotificationProvider>` is now mounted in `RealProviders`, so any story
// that uses RealProviders can fire toasts.
import type { Meta, StoryObj } from '@storybook/react-vite';
import Button from '@risk-smart/themed-cloudscape-components/button';
// eslint-disable-next-line import/no-unresolved
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { useEffect } from 'react';

import '../_setup';
import { RealProviders } from '../../app-shell/_providers';

const meta = {
  title: 'Cloudscape Reference/Notifications',
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Real RiskSmart notifications system. 1:1 with live app. Toasts use react-hot-toast under the hood and render the production NotificationBanner component (animated icon, dismissable for errors).',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Stage = ({ children }: { children: React.ReactNode }) => (
  <RealProviders initialPath={'/'}>
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', minHeight: 400 }}>
      {children}
    </div>
  </RealProviders>
);

const TriggerButton = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => <Button onClick={onClick}>{label}</Button>;

const InfoTrigger = () => {
  const { addNotification } = useNotifications();
  return <TriggerButton label={'Show info toast'} onClick={() => addNotification({ content: 'Heads up — your changes have been saved.' })} />;
};

const SuccessTrigger = () => {
  const { addNotification } = useNotifications();
  return <TriggerButton label={'Show success toast'} onClick={() => addNotification({ type: 'success', content: 'Risk created successfully.' })} />;
};

const ErrorTrigger = () => {
  const { addNotification } = useNotifications();
  return <TriggerButton label={'Show error toast'} onClick={() => addNotification({ type: 'error', content: 'Something went wrong while saving — please try again.' })} />;
};

const StackedTrigger = () => {
  const { addNotification } = useNotifications();
  return (
    <TriggerButton
      label={'Show 3 stacked toasts'}
      onClick={() => {
        addNotification({ type: 'success', content: 'Risk R-001 created.' });
        setTimeout(() => addNotification({ content: 'Linked control "IAM policy review".' }), 200);
        setTimeout(() => addNotification({ type: 'error', content: 'Failed to attach file — retry?' }), 400);
      }}
    />
  );
};

const AutoFire = ({ payload }: { payload: Parameters<ReturnType<typeof useNotifications>['addNotification']>[0] }) => {
  const { addNotification } = useNotifications();
  useEffect(() => {
    const t = setTimeout(() => addNotification(payload), 200);
    return () => clearTimeout(t);
  }, [addNotification, payload]);
  return null;
};

export const Default: Story = {
  render: () => (
    <Stage>
      <p>Click the button to fire an info toast (the default type).</p>
      <InfoTrigger />
    </Stage>
  ),
};

export const Success: Story = {
  render: () => (
    <Stage>
      <SuccessTrigger />
      <AutoFire payload={{ type: 'success', content: 'Risk created successfully.' }} />
    </Stage>
  ),
};

export const ErrorVariant: Story = {
  name: 'Error',
  render: () => (
    <Stage>
      <ErrorTrigger />
      <AutoFire payload={{ type: 'error', content: 'Could not save changes — try again.' }} />
    </Stage>
  ),
};

export const MultipleStacked: Story = {
  render: () => (
    <Stage>
      <StackedTrigger />
    </Stage>
  ),
};
