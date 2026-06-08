import { t } from 'i18next';
import _ from 'lodash';

import type { WidgetDefinition } from '../types';
import type { GigawidgetSettings } from '../universal-widget/util';
import { privateWidgets as overallWidgets } from '../widgetPrivate';
import { createWidget, defaultWidgetOptions } from '../widgets/utils';

const getWidgets = () => {
  const widgets: Record<string, WidgetDefinition> = {
    myOverdueItems7Days: createWidget({
      ...defaultWidgetOptions.table,
      translationKeyPrefix:
        'dashboard.myItemsDashboard.widgets.myDueItems7Days',
      settings: {
        dataSource: 'myOverdueItems7Days',
        chartType: 'table',
        allowOwnershipFiltering: true,
        noClickthroughMessageContent: t('dashboard.my_items_filters_alert'),
      },
      definition: {
        defaultRowSpan: 3,
        defaultColumnSpan: 2,
      },
    }),
    myOverdueItems30Days: createWidget({
      ...defaultWidgetOptions.table,
      translationKeyPrefix:
        'dashboard.myItemsDashboard.widgets.myDueItems30Days',
      settings: {
        dataSource: 'myOverdueItems30Days',
        chartType: 'table',
        allowOwnershipFiltering: true,
        noClickthroughMessageContent: t('dashboard.my_items_filters_alert'),
      },
      definition: {
        defaultRowSpan: 3,
        defaultColumnSpan: 2,
      },
    }),
  };

  // Merge with overall widgets
  Object.keys(overallWidgets).forEach((key: keyof typeof overallWidgets) => {
    if (!overallWidgets[key]?.showOnMyItems) {
      return;
    }
    const widget = _.cloneDeep(overallWidgets[key]);
    if (!widget.settings) {
      widget.settings = {};
    }
    (widget.settings as GigawidgetSettings).allowOwnershipFiltering = true;
    (widget.settings as GigawidgetSettings).noClickthroughMessageContent = t(
      'dashboard.my_items_filters_alert'
    );
    widgets[`myItems_${key}`] = widget;
  });

  return widgets;
};

export default getWidgets;
