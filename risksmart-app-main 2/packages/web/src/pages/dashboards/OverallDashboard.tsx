import { useMutation, useQuery } from '@apollo/client';
import type {
  BoardProps,
  ItemsPaletteProps,
} from '@cloudscape-design/board-components';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import HelpPanel from '@risk-smart/themed-cloudscape-components/help-panel';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { useTools } from '@risksmart-app/components/src/tools/useTools';
import type { GetDashboardByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetDashboardByIdDocument,
  namedOperations,
  UpdateDashboardDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ActionsButton from 'src/components/actions-button';
import type { ActionItem } from 'src/components/actions-button/ActionsButton';
import { useAggregation } from 'src/hooks/useAggregation';
import { useIsModuleEnabledLazy } from 'src/hooks/useIsModuleEnabled';
import { PageLayout } from 'src/layouts';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { useHasPermissionLazy } from 'src/rbac/useHasPermissionLazy';

import { useUpdateResultNotification } from '@/hooks/useMutationResultNotification';
import { handleError } from '@/utils/errorUtils';

import { defaultDashboardFilter } from '../../context/defaultDashboardFilter';
import { processWidgets } from '../../context/processWidgets';
import DashboardViewToggle from './dashboard-view-toggle/DashboardViewToggle';
import { DashboardSelector } from './DashboardSelector';
import { defaultOverallDashboardLayout } from './defaultLayout';
import Filters from './filters';
import { useGetImageZip } from './hooks/useGetImageZip';
import ItemPalette from './item-palette';
import LayoutBoard from './layout-board';
import { SaveDashboardModal } from './SaveDashboardModal';
import styles from './style.module.scss';
import type { StoredWidgetDefinition, WidgetDefinition } from './types';
import type {
  DashboardFilter,
  OverallDashboardState,
} from './useDashboardStore';
import { useDashboardStore } from './useDashboardStore';
import { getWidgets } from './widgets';
import {
  filterWidgetsByUserPermissions,
  getPaletteItems,
} from './widgets/utils';

export type Dashboard = GetDashboardByIdQuery['dashboard_by_pk'];

const OverallDashboard: FC = () => {
  const hasPermission = useHasPermissionLazy();
  const isModuleEnabled = useIsModuleEnabledLazy();
  const { t } = useTranslation(['common'], { keyPrefix: 'dashboard' });
  const [, setToolsContent] = useTools();
  const [openSaveDashboard, setOpenSaveDashboard] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState(false);
  const [updateDashboard] = useMutation(UpdateDashboardDocument, {
    refetchQueries: [namedOperations.Query.getDashboards],
  });
  const widgetList = getWidgets();
  const {
    id: selectedDashboardId,
    filters,
    setFilters,
    widgets,
    setWidgets,
    setDashboardPreferences,
  } = useDashboardStore();
  const { getImageZip } = useGetImageZip();
  const { addNotification } = useNotifications();
  const { riskModel } = useAggregation();

  const { data: currentDashboardData } = useQuery(GetDashboardByIdDocument, {
    variables: { Id: selectedDashboardId! },
    skip: !selectedDashboardId,
  });
  const currentDashboard = currentDashboardData?.dashboard_by_pk;

  const filtersEnabledCount = useMemo(() => {
    let count = 0;
    count += filters.departments.length;
    count += filters.tags.length;
    if (filters.dateRange) {
      count++;
    }

    return count;
  }, [filters]);

  const resetFilters = () => setFilters(defaultDashboardFilter);

  const getFilteredWidgets = useCallback(() => {
    const definitions: BoardProps.Item<StoredWidgetDefinition>[] = [];
    for (const widget of filterWidgetsByUserPermissions({
      widgets: widgetList,
      widgetsToFilter: widgets,
      hasPermission,
      riskModel,
      isModuleEnabled,
    })) {
      if (!widgetList[widget.widgetType]) {
        handleError(`Unable to find widget with type ${widget.widgetType}`);
        continue;
      }
      const definition = {
        ...widget,
        data: {
          widgetType: widget.widgetType,
          ...widgetList[widget.widgetType],
        },
        definition: widgetList[widget.widgetType].definition,
      };
      definitions.push(definition);
    }

    return definitions;
  }, [hasPermission, isModuleEnabled, riskModel, widgets, widgetList]);

  const [paletteItems, setPaletteItems] = useState<
    ItemsPaletteProps.Item<WidgetDefinition>[]
  >(() =>
    getPaletteItems({
      widgets: widgetList,
      items: getFilteredWidgets(),
      hasPermission,
      riskModel,
      isModuleEnabled,
    })
  );

  useEffect(() => {
    setPaletteItems(
      getPaletteItems({
        widgets: widgetList,
        items: getFilteredWidgets(),
        hasPermission,
        riskModel,
        isModuleEnabled,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskModel, isModuleEnabled]);

  const onFilterChange = (newFilters: DashboardFilter) => {
    setFilters(newFilters);
  };

  const changeDashboard = (dashboardToLoad?: OverallDashboardState) => {
    const newItems = filterWidgetsByUserPermissions({
      widgets: widgetList,
      widgetsToFilter: dashboardToLoad
        ? processWidgets(dashboardToLoad.widgets)
        : defaultOverallDashboardLayout,
      hasPermission,
      riskModel,
      isModuleEnabled,
    });

    setDashboardPreferences({
      id: dashboardToLoad?.id,
      filters: dashboardToLoad
        ? dashboardToLoad.filters
        : defaultDashboardFilter,
      widgets: newItems,
    });

    setPaletteItems(
      getPaletteItems({
        widgets: widgetList,
        items: newItems.map((ni) => ({
          ...ni,
          data: { widgetType: ni.widgetType, ...widgetList[ni.widgetType] },
          definition: widgetList[ni.widgetType].definition,
        })),
        hasPermission,
        riskModel,
        isModuleEnabled,
      })
    );
  };

  const saveDashboard = useUpdateResultNotification({
    entityName: 'Dashboard',
    asyncAction: async () => {
      if (!currentDashboard) {
        console.error('missing dashboard ID when trying to update dashboard');

        return false;
      }
      await updateDashboard({
        variables: {
          ...currentDashboard,
          Content: {
            filters,
            widgets: filterWidgetsByUserPermissions({
              widgets: widgetList,
              widgetsToFilter: widgets,
              hasPermission,
              riskModel,
              isModuleEnabled,
            }),
          },
          ContributorUserIds: currentDashboard.contributors.map(
            (c) => c.UserId
          ),
          ContributorGroupIds: currentDashboard.contributorGroups.map(
            (c) => c.UserGroupId
          ),
        },
      });

      return true;
    },
  });

  const { hasPermission: canUpdate, loading: canUpdateLoading } =
    useHasPermissionQuery('update:dashboard', currentDashboard ?? undefined);

  const actionsButtonItems: ActionItem[] = [
    {
      text: t('actions.addWidget'),
      id: 'add_widget',
      onItemClick: () => setToolsContent('page-content'),
    },
    {
      text: t('actions.new'),
      id: 'reset_dashboard',
      onItemClick: changeDashboard,
    },
    ...(canUpdate && !canUpdateLoading
      ? [
          {
            text: t('actions.save'),
            id: 'save_dashboard',
            onItemClick: async () => {
              if (selectedDashboardId) {
                await saveDashboard({});
              } else {
                setOpenSaveDashboard(true);
              }
            },
          },
        ]
      : []),
    {
      text: t('actions.saveAs'),
      id: 'save_as_dashboard',
      onItemClick: () => setOpenSaveDashboard(true),
    },
    ...(canUpdate && !canUpdateLoading
      ? [
          {
            text: t('actions.edit'),
            id: 'edit_dashboard',
            onItemClick: () => {
              setOpenSaveDashboard(true);
              setEditingDashboard(true);
            },
          },
        ]
      : []),
    {
      text: t('actions.clear'),
      id: 'clear',
      onItemClick: () =>
        changeDashboard({
          id: currentDashboard?.Id,
          filters: {
            tags: [],
            departments: [],
            dateRange: null,
          },
          widgets: [],
        }),
    },
    {
      text: t('actions.exportZip'),
      id: 'export_dashboard_images',
      onItemClick: async () => {
        try {
          addNotification({
            type: 'success',
            content: t('actions.exportZipStarted'),
          });
          await getImageZip();
        } catch (error) {
          handleError(error);
          addNotification({
            type: 'error',
            content: t('actions.exportZipFailed'),
          });
        }
      },
    },
  ];

  return (
    <PageLayout
      helpTranslationKey={'dashboard.help'}
      title={t('overall_page_title')}
      secondary={
        <form
          className={
            'grid place-items-stretch grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 print:hidden'
          }
        >
          <DashboardSelector
            onChange={changeDashboard}
            selected={selectedDashboardId}
          />
          <Filters onChange={onFilterChange} />
        </form>
      }
      actions={
        <SpaceBetween size={'s'} direction={'horizontal'}>
          <div className={'flex gap-3 items-center'}>
            {filtersEnabledCount > 0 && (
              <Alert
                type={'info'}
                className={styles.clearFilterAlert}
                header={
                  <div className={'flex gap-3 items-center'}>
                    {t('filters_alert', { count: filtersEnabledCount })}
                    {'.'}
                    <Button onClick={resetFilters} variant={'inline-link'}>
                      {/* TODO: translation */}
                      {'Clear'}
                    </Button>
                  </div>
                }
              />
            )}
            <DashboardViewToggle />
            <ActionsButton
              testId={'dashboardMenu'}
              items={actionsButtonItems}
              buttonText={t('actions_button')}
              variant={'normal'}
            />
          </div>
        </SpaceBetween>
      }
      panelContent={
        <HelpPanel header={t('side_panel_title')}>
          <ItemPalette items={paletteItems} />
        </HelpPanel>
      }
    >
      {openSaveDashboard && (
        <SaveDashboardModal
          onDismiss={() => {
            setOpenSaveDashboard(false);
            setEditingDashboard(false);
          }}
          dashboardContent={{ widgets, filters }}
          isEditing={editingDashboard}
          onDelete={changeDashboard}
        />
      )}
      <LayoutBoard
        items={getFilteredWidgets()}
        onAddWidgetClick={() => setToolsContent('page-content')}
        onItemsChanged={(items) => {
          setWidgets(
            items.map((item) => {
              const widget = widgets.find((w) => item.id === w.id);

              return {
                id: item.id,
                widgetType: item.data.widgetType,
                ...widget,
                rowSpan: item.rowSpan,
                columnSpan: item.columnSpan,
                columnOffset: item.columnOffset,
              };
            })
          );
          setPaletteItems(
            getPaletteItems({
              widgets: widgetList,
              items,
              hasPermission,
              riskModel,
              isModuleEnabled,
            })
          );
        }}
      />
    </PageLayout>
  );
};

export default OverallDashboard;
