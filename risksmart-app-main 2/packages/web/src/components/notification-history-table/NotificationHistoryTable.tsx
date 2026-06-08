import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';
import Box from '@risk-smart/themed-cloudscape-components/box';
import type { ButtonGroupProps } from '@risk-smart/themed-cloudscape-components/button-group';
import ButtonGroup from '@risk-smart/themed-cloudscape-components/button-group';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import type { LocalStorageKeys } from '@risksmart-app/components/src/hooks/useLocalStorage';
import Table from '@risksmart-app/components/src/table';
import type { SortingState } from '@risksmart-app/components/src/table/tableUtils';
import type { FC, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TabHeader from 'src/components/tab-header';

import type {
  DateRangePreset,
  NotificationHistoryItem,
} from '@/hooks/notifications/types';
import { computeDateRange } from '@/hooks/notifications/useNotificationHistory';
import { useOrgScopedLocalStorage } from '@/hooks/useOrgScopedLocalStorage';
import { useGetStatelessTableProps } from '@/utils/table/hooks/useGetStatelessTableProps';
import type { TablePreferences } from '@/utils/table/types';
import { emptyFilterQuery } from '@/utils/table/types';

import { useGetFieldConfig } from '../../pages/settings/tabs/notifications/config';

const MAX_ITEMS = 10_000;

const DATE_RANGE_PRESETS: DateRangePreset[] = [
  'last24h',
  'last7',
  'last30',
  'last90',
];

export interface NotificationHistoryTableProps {
  items: NotificationHistoryItem[];
  isLoading: boolean;
  isFetchingMore: boolean;
  totalLoaded: number;
  currentPreset: DateRangePreset;
  onDateRangeChange: (dateRange: ReturnType<typeof computeDateRange>) => void;
  defaultPreferences: TablePreferences<NotificationHistoryItem>;
  localStorageKey: LocalStorageKeys;
  expandableRows?: ReturnType<
    () => {
      isItemExpandable: (item: NotificationHistoryItem) => boolean;
      getItemChildren: (
        item: NotificationHistoryItem
      ) => NotificationHistoryItem[];
      expandedItems: { id: string }[];
      onExpandableItemToggle: (event: {
        detail: { item: NotificationHistoryItem; expanded: boolean };
      }) => void;
    }
  >;
  headerContent?: ReactNode;
}

const NotificationHistoryTable: FC<NotificationHistoryTableProps> = ({
  items,
  isLoading,
  isFetchingMore,
  totalLoaded,
  currentPreset,
  onDateRangeChange,
  defaultPreferences: defaultPrefs,
  localStorageKey,
  expandableRows,
  headerContent,
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'notificationHistory',
  });

  const fields = useGetFieldConfig();

  const [sortingState, setSortingState] = useState<
    SortingState<NotificationHistoryItem> | undefined
  >(undefined);
  const [propertyFilter, setPropertyFilter] = useState<
    PropertyFilterQuery | undefined
  >(emptyFilterQuery);
  const [preferences, setPreferences] = useOrgScopedLocalStorage<
    TablePreferences<NotificationHistoryItem> | undefined
  >(defaultPrefs, { localStorageKey });

  const tableProps = useGetStatelessTableProps<NotificationHistoryItem>({
    data: items,
    entityLabel: 'Notification',
    fields,
    sortingState,
    setSortingState,
    propertyFilter,
    setPropertyFilter,
    preferences,
    setPreferences,
    enableFiltering: true,
    customAttributeFormIds: [],
  });

  const selectedDateRangeLabel = String(t(`dateRange.${currentPreset}`));

  const buttonGroupItems: ButtonGroupProps['items'] = useMemo(
    () => [
      {
        type: 'group' as const,
        text: t('date_range_menu'),
        items: [
          {
            type: 'menu-dropdown' as const,
            id: 'date-range',
            text: t('date_range_menu'),
            loading: isFetchingMore,
            loadingText: t('loading_more'),
            items: DATE_RANGE_PRESETS.map((preset) => ({
              itemType: 'checkbox' as const,
              id: preset,
              text: String(t(`dateRange.${preset}`)),
              checked: currentPreset === preset,
            })),
          },
        ],
      },
      {
        type: 'group' as const,
        text: t('export_button'),
        items: [
          {
            type: 'icon-button' as const,
            id: 'export',
            text: t('export_button'),
            iconName: 'download' as const,
          },
        ],
      },
    ],
    [t, currentPreset, isFetchingMore]
  );

  const handleItemClick = useCallback(
    ({ detail }: { detail: ButtonGroupProps.ItemClickDetails }) => {
      if (detail.id === 'export') {
        tableProps.exportToCsv?.();
      } else if (DATE_RANGE_PRESETS.includes(detail.id as DateRangePreset)) {
        onDateRangeChange(computeDateRange(detail.id as DateRangePreset));
      }
    },
    [tableProps, onDateRangeChange]
  );

  const counterText = (() => {
    if (totalLoaded >= MAX_ITEMS) {
      return `(${MAX_ITEMS.toLocaleString()} - limit reached)`;
    }
    if (isFetchingMore) {
      return `(${totalLoaded.toLocaleString()}...)`;
    }

    return `(${totalLoaded.toLocaleString()})`;
  })();

  return (
    <Table
      {...tableProps}
      {...(expandableRows ? { expandableRows } : {})}
      trackBy={'id'}
      loading={isLoading}
      loadingText={t('loading')}
      header={
        <TabHeader
          counter={counterText}
          actions={
            <SpaceBetween
              direction={'horizontal'}
              size={'xs'}
              alignItems={'center'}
            >
              <Box variant={'small'} color={'text-status-inactive'}>
                {selectedDateRangeLabel}
              </Box>
              <ButtonGroup
                ariaLabel={t('actions_aria_label')}
                variant={'icon'}
                items={buttonGroupItems}
                onItemClick={handleItemClick}
                dropdownExpandToViewport={true}
              />
            </SpaceBetween>
          }
        >
          {headerContent ?? t('tab_title')}
        </TabHeader>
      }
      variant={'embedded'}
      empty={
        !isFetchingMore && !isLoading ? (
          <Box textAlign={'center'} color={'inherit'} padding={'l'}>
            <Box variant={'p'} color={'inherit'}>
              {t('empty')}
            </Box>
          </Box>
        ) : undefined
      }
    />
  );
};

export default NotificationHistoryTable;
