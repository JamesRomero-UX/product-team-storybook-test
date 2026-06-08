import type { BadgeProps } from '@risk-smart/themed-cloudscape-components/badge';
import Badge from '@risk-smart/themed-cloudscape-components/badge';
import Popover from '@risk-smart/themed-cloudscape-components/popover';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { dateRangeFilterOperators } from '@/components/date-time-filter/dateFilterOperator';
import Link from '@/components/link';
import type { NotificationHistoryItem } from '@/hooks/notifications/types';
import { toLocalDateTime } from '@/utils/dateUtils';
import type { TableFields } from '@/utils/table/types';

const DELIVERY_STATUS_COLORS: Record<
  string,
  NonNullable<BadgeProps['color']>
> = {
  delivered: 'green',
  sent: 'blue',
  queued: 'grey',
  undelivered: 'red',
  not_sent: 'red',
  bounced: 'red',
  delivery_attempted: 'grey',
};

export const useGetFieldConfig = (): TableFields<NotificationHistoryItem> => {
  const { t } = useTranslation('common', {
    keyPrefix: 'notificationHistory',
  });

  return useMemo(
    () => ({
      recipientName: {
        header: t('columns.recipient'),
        cell: (item) => {
          const displayName = item.recipientName || item.recipientEmail || '-';
          if (item.recipientEmail) {
            return (
              <Popover
                dismissButton={false}
                position={'top'}
                size={'medium'}
                triggerType={'text'}
                content={item.recipientEmail}
              >
                <span
                  style={{
                    borderBottom: '1px dashed currentColor',
                    cursor: 'pointer',
                  }}
                >
                  {displayName}
                </span>
              </Popover>
            );
          }

          return displayName;
        },
        exportVal: (item) => item.recipientName || item.recipientEmail || '-',
      },
      objectTypeLabel: {
        header: t('columns.objectType'),
        cell: (item) => item.objectTypeLabel,
        filterOptions: {
          filteringProperties: {
            operators: ['=', '!='],
          },
        },
        exportVal: (item) => item.objectTypeLabel,
      },
      workflowLabel: {
        header: t('columns.workflow'),
        cell: (item) => {
          if (
            !item.isDigestActivity &&
            (item.source?.key === 'digest' || item.workflow === 'digest')
          ) {
            const count = item.totalActivities;

            return count != null
              ? t('digest_count', { count })
              : item.workflowLabel || '-';
          }

          return item.workflowLabel || '-';
        },
        exportVal: (item) => item.workflowLabel || '-',
      },
      channelName: {
        header: t('columns.channel'),
        cell: (item) => {
          if (item.isDigestActivity) {
            return '-';
          }

          return item.channelName || item.channel_id || '-';
        },
        filterOptions: {
          filteringProperties: {
            operators: ['=', '!='],
          },
        },
        exportVal: (item) => item.channelName || item.channel_id || '-',
      },
      deliveryStatus: {
        header: t('columns.deliveryStatus'),
        cell: (item) => {
          if (item.isDigestActivity) {
            return '-';
          }

          const label = String(
            t(`deliveryStatus.${item.deliveryStatus}`, {
              defaultValue: item.deliveryStatus,
            })
          );
          const color = DELIVERY_STATUS_COLORS[item.deliveryStatus] ?? 'grey';

          return <Badge color={color}>{label}</Badge>;
        },
        filterOptions: {
          filteringProperties: {
            operators: ['=', '!='],
          },
        },
        exportVal: (item) =>
          String(
            t(`deliveryStatus.${item.deliveryStatus}`, {
              defaultValue: item.deliveryStatus,
            })
          ),
      },
      engagementStatuses: {
        header: t('columns.engagementStatus'),
        cell: (item) => {
          const statuses = item.engagementStatuses ?? [];
          if (statuses.length === 0) {
            return '-';
          }

          return statuses
            .map((s) => String(t(`engagementStatus.${s}`, { defaultValue: s })))
            .join(', ');
        },
        filterOptions: {
          filteringProperties: {
            operators: [':', '!:'],
          },
        },
        exportVal: (item) =>
          (item.engagementStatuses ?? [])
            .map((s) => String(t(`engagementStatus.${s}`, { defaultValue: s })))
            .join(', ') || '-',
      },
      insertedAt: {
        header: t('columns.timestamp'),
        cell: (item) => toLocalDateTime(item.inserted_at),
        sortingField: 'inserted_at',
        filterOptions: {
          filteringProperties: {
            operators: dateRangeFilterOperators,
          },
        },
        exportVal: (item) => toLocalDateTime(item.inserted_at),
      },
      link: {
        header: t('columns.link'),
        cell: (item) => {
          if (!item.link) {
            return null;
          }

          return (
            <Link variant={'secondary'} href={item.link}>
              {t('link_view')}
            </Link>
          );
        },
        exportVal: (item) => item.link ?? '',
      },
    }),
    [t]
  );
};
