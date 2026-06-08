import type {
  BoardProps,
  ItemsPaletteProps,
} from '@cloudscape-design/board-components';
import HelpPanel from '@risk-smart/themed-cloudscape-components/help-panel';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { useTools } from '@risksmart-app/components/src/tools/useTools';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ActionItem } from 'src/components/actions-button/ActionsButton';
import ActionsButton from 'src/components/actions-button/ActionsButton';
import { useAggregation } from 'src/hooks/useAggregation';
import { useIsModuleEnabledLazy } from 'src/hooks/useIsModuleEnabled';
import { PageLayout } from 'src/layouts';
import { useHasPermissionLazy } from 'src/rbac/useHasPermissionLazy';

import { handleError } from '@/utils/errorUtils';

import DashboardViewToggle from '../dashboard-view-toggle/DashboardViewToggle';
import { useGetImageZip } from '../hooks/useGetImageZip';
import ItemPalette from '../item-palette';
import LayoutBoard from '../layout-board';
import type { StoredWidgetDefinition, WidgetDefinition } from '../types';
import { useDashboardStore } from '../useDashboardStore';
import {
  filterWidgetsByUserPermissions,
  getPaletteItems,
} from '../widgets/utils';
import FilterOptions from './FilterOptions';
import MyItemsRibbon from './Ribbon';
import { getWidgets } from './widgets';

const Dashboard: FC = () => {
  const hasPermission = useHasPermissionLazy();
  const [, setToolsContent] = useTools();
  const isModuleEnabled = useIsModuleEnabledLazy();
  const { t } = useTranslation(['common'], { keyPrefix: 'dashboard' });
  const { myItemsWidgets, setMyItemsWidgets } = useDashboardStore();

  const widgets = useMemo(() => getWidgets(), []);

  const { addNotification } = useNotifications();
  const { getImageZip } = useGetImageZip();
  const { riskModel } = useAggregation();

  const actionsButtonItems: ActionItem[] = [
    {
      text: t('actions.addWidget'),
      id: 'add_widget',
      onItemClick: () => setToolsContent('page-content'),
    },
    {
      text: t('actions.clear'),
      id: 'clear',
      onItemClick: () => {
        setMyItemsWidgets([]);
      },
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

  const getFilteredWidgets = useCallback(() => {
    const definitions: BoardProps.Item<StoredWidgetDefinition>[] = [];
    for (const widget of filterWidgetsByUserPermissions({
      widgets,
      widgetsToFilter: myItemsWidgets,
      hasPermission,
      riskModel,
      isModuleEnabled,
    })) {
      if (!widgets[widget.widgetType]) {
        handleError(`Unable to find widget with type ${widget.widgetType}`);
        continue;
      }
      const definition = {
        ...widget,
        data: {
          widgetType: widget.widgetType,
          ...widgets[widget.widgetType],
        },
        definition: widgets[widget.widgetType].definition,
      };
      definitions.push(definition);
    }

    return definitions;
  }, [hasPermission, isModuleEnabled, riskModel, myItemsWidgets, widgets]);

  const [paletteItems, setPaletteItems] = useState<
    ItemsPaletteProps.Item<WidgetDefinition>[]
  >(() =>
    getPaletteItems({
      widgets,
      items: getFilteredWidgets(),
      hasPermission,
      riskModel,
      isModuleEnabled,
    })
  );

  useEffect(() => {
    setPaletteItems(
      getPaletteItems({
        widgets,
        items: getFilteredWidgets(),
        hasPermission,
        riskModel,
        isModuleEnabled,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskModel, isModuleEnabled]);

  return (
    <PageLayout
      title={t('my_items_page_title')}
      actions={
        <SpaceBetween size={'s'} direction={'horizontal'}>
          <div className={'flex gap-3 items-center'}>
            <FilterOptions />
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
      <MyItemsRibbon />
      <LayoutBoard
        items={getFilteredWidgets()}
        onAddWidgetClick={() => setToolsContent('page-content')}
        onItemsChanged={(items) => {
          setMyItemsWidgets(
            items.map((item) => {
              const widget = myItemsWidgets.find((w) => item.id === w.id);

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
              widgets,
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

export default Dashboard;
