// Settings → Notifications tab
//
// Mirrors pages/settings/tabs/notifications/Tab.tsx +
// components/notification-history-table/NotificationHistoryTable.tsx.
//
// Production layout:
//   <NotificationHistoryTable {...props} />
// with TabHeader + DateRangePicker (preset filter) above the table,
// pageSize 50, sticky first column.
//
// Default visible columns (production):
//   recipientName | objectTypeLabel | workflowLabel | channelName |
//   deliveryStatus | insertedAt | link
//
// We render the same column set against in-memory rows. The date
// range filter is shown but non-functional in the prototype.

import { useCollection } from '@cloudscape-design/collection-hooks';
import Box from '@risk-smart/themed-cloudscape-components/box';
import DateRangePicker from '@risk-smart/themed-cloudscape-components/date-range-picker';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import StatusIndicator from '@risk-smart/themed-cloudscape-components/status-indicator';
// eslint-disable-next-line import/no-unresolved
import Table from '@risksmart-app/components/src/table';
// eslint-disable-next-line import/no-unresolved
import TabHeader from 'src/components/tab-header';
import { useState } from 'react';

type NotificationRow = {
  id: string;
  recipientName: string;
  objectTypeLabel: string;
  workflowLabel: string;
  channelName: 'email' | 'slack' | 'in-app';
  deliveryStatus: 'sent' | 'queued' | 'failed' | 'bounced';
  insertedAt: string;
  link: string;
};

const SAMPLE: NotificationRow[] = [
  { id: 'n-001', recipientName: 'Aisha Patel',     objectTypeLabel: 'Risk',          workflowLabel: 'Review reminder',           channelName: 'email',  deliveryStatus: 'sent',    insertedAt: '2026-05-13 09:42', link: '/risks/r-481' },
  { id: 'n-002', recipientName: 'James Romero',    objectTypeLabel: 'Obligation',    workflowLabel: 'Obligation due soon',        channelName: 'email',  deliveryStatus: 'sent',    insertedAt: '2026-05-13 09:30', link: '/obligations/o-127' },
  { id: 'n-003', recipientName: 'Mei Ling',        objectTypeLabel: 'Issue',         workflowLabel: 'Issue assigned',             channelName: 'in-app', deliveryStatus: 'sent',    insertedAt: '2026-05-13 08:15', link: '/issues/i-202' },
  { id: 'n-004', recipientName: 'risk-team@acme',  objectTypeLabel: 'Digest',        workflowLabel: 'Weekly risk digest',         channelName: 'email',  deliveryStatus: 'sent',    insertedAt: '2026-05-12 18:00', link: '/digests/d-44' },
  { id: 'n-005', recipientName: 'Tariq Ahmed',     objectTypeLabel: 'Control',       workflowLabel: 'Control test reminder',      channelName: 'email',  deliveryStatus: 'failed',  insertedAt: '2026-05-12 14:22', link: '/controls/c-88' },
  { id: 'n-006', recipientName: 'Sara Holm',       objectTypeLabel: 'Audit',         workflowLabel: 'Audit fieldwork starting',   channelName: 'slack',  deliveryStatus: 'sent',    insertedAt: '2026-05-12 11:05', link: '/audits/a-12' },
  { id: 'n-007', recipientName: 'Diego Alvarez',   objectTypeLabel: 'Approval',      workflowLabel: 'Approval requested',         channelName: 'email',  deliveryStatus: 'queued',  insertedAt: '2026-05-12 10:48', link: '/approvals/ap-9' },
  { id: 'n-008', recipientName: 'Yuki Tanaka',     objectTypeLabel: 'Policy',        workflowLabel: 'Policy attestation due',     channelName: 'email',  deliveryStatus: 'bounced', insertedAt: '2026-05-11 17:30', link: '/policies/p-303' },
  { id: 'n-009', recipientName: 'Hannah O\'Brien', objectTypeLabel: 'Questionnaire', workflowLabel: 'Questionnaire response due', channelName: 'email',  deliveryStatus: 'sent',    insertedAt: '2026-05-11 16:11', link: '/questionnaires/q-55' },
  { id: 'n-010', recipientName: 'Emma Wright',     objectTypeLabel: 'Third party',   workflowLabel: 'Re-assessment due',          channelName: 'in-app', deliveryStatus: 'sent',    insertedAt: '2026-05-11 09:00', link: '/third-parties/t-7' },
];

const statusType = (s: NotificationRow['deliveryStatus']) => {
  if (s === 'sent') return 'success';
  if (s === 'queued') return 'in-progress';
  if (s === 'failed' || s === 'bounced') return 'error';
  return 'pending';
};

const COLUMNS = [
  {
    id: 'recipientName',
    header: 'Recipient',
    cell: (n: NotificationRow) => n.recipientName,
    isRowHeader: true,
    sortingField: 'recipientName',
    minWidth: 180,
  },
  {
    id: 'objectTypeLabel',
    header: 'Object',
    cell: (n: NotificationRow) => n.objectTypeLabel,
    sortingField: 'objectTypeLabel',
    minWidth: 140,
  },
  {
    id: 'workflowLabel',
    header: 'Workflow',
    cell: (n: NotificationRow) => n.workflowLabel,
    sortingField: 'workflowLabel',
    minWidth: 220,
  },
  {
    id: 'channelName',
    header: 'Channel',
    cell: (n: NotificationRow) => n.channelName,
    sortingField: 'channelName',
    minWidth: 100,
  },
  {
    id: 'deliveryStatus',
    header: 'Status',
    cell: (n: NotificationRow) => (
      <StatusIndicator type={statusType(n.deliveryStatus) as any}>
        {n.deliveryStatus}
      </StatusIndicator>
    ),
    sortingField: 'deliveryStatus',
    minWidth: 120,
  },
  {
    id: 'insertedAt',
    header: 'Sent at',
    cell: (n: NotificationRow) => n.insertedAt,
    sortingField: 'insertedAt',
    minWidth: 160,
  },
  {
    id: 'link',
    header: 'Object link',
    cell: (n: NotificationRow) => (
      <a
        href={'#'}
        style={{
          color: 'var(--color-text-link-default, #079589)',
          textDecoration: 'none',
        }}
      >
        {n.link}
      </a>
    ),
    minWidth: 200,
  },
];

const PRESETS = [
  { type: 'relative', key: 'last-7-days',  amount: 7,  unit: 'day'  },
  { type: 'relative', key: 'last-30-days', amount: 30, unit: 'day'  },
  { type: 'relative', key: 'last-90-days', amount: 90, unit: 'day'  },
];

const NotificationsTab = () => {
  const collection = useCollection(SAMPLE, { sorting: {}, pagination: { pageSize: 50 } });
  const [dateRange, setDateRange] = useState<any>({
    type: 'relative',
    amount: 7,
    unit: 'day',
    key: 'last-7-days',
  });

  return (
    <Table
      {...collection.collectionProps}
      items={collection.items}
      columnDefinitions={COLUMNS as any}
      trackBy={'id'}
      variant={'embedded'}
      loadingText={'Loading notifications'}
      stickyColumns={{ first: 1, last: 0 }}
      empty={
        <Box textAlign={'center'} color={'inherit'}>
          {'No notifications in this period.'}
        </Box>
      }
      header={
        <SpaceBetween size={'m'}>
          <TabHeader>{'Notification history'}</TabHeader>
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <DateRangePicker
              value={dateRange}
              onChange={({ detail }) => setDateRange(detail.value)}
              relativeOptions={PRESETS as any}
              isValidRange={() => ({ valid: true } as any)}
              i18nStrings={{ relativeModeTitle: 'Relative range' } as any}
              placeholder={'Filter by date range'}
            />
          </SpaceBetween>
        </SpaceBetween>
      }
    />
  );
};

export default NotificationsTab;
