import { useCallback } from 'react';
import { useDashboardStore } from 'src/pages/dashboards/useDashboardStore';

import { sanitiseSettings } from '../pages/dashboards/universal-widget/sanitiseSettings';
import type { GigawidgetSettings } from '../pages/dashboards/universal-widget/util';
import { useWidgetContext } from '../pages/dashboards/widget-context/WidgetContext';

export const useDashboardWidgetSettings = <T = unknown,>(): [
  null | T,
  (settings: T) => void,
] => {
  const widgetData = useWidgetContext();
  const { widgets, myItemsWidgets, setWidgets, setMyItemsWidgets } =
    useDashboardStore();

  const widget = widgetData
    ? [...widgets, ...myItemsWidgets].find((w) => w.id === widgetData.widgetId)
    : undefined;

  const sanitizedSettings = widget?.settings
    ? sanitiseSettings(widget?.settings as GigawidgetSettings)
    : undefined;

  // Note, widget can be null in previous mode as not yet on the dashboard
  const setWidgetSettings = useCallback(
    (settings: T) => {
      if (!widgetData) {
        return;
      }
      const { widgetId } = widgetData;

      const widget = widgets.find((w) => w.id === widgetId);
      if (widget) {
        widget.settings = settings;
        setWidgets(widgets);

        return;
      }

      const myItemsWidget = myItemsWidgets.find((w) => w.id === widgetId);
      if (myItemsWidget) {
        myItemsWidget.settings = settings;
        setMyItemsWidgets(myItemsWidgets);

        return;
      }
    },
    [widgetData, widgets, myItemsWidgets, setWidgets, setMyItemsWidgets]
  );

  return [sanitizedSettings as unknown as T, setWidgetSettings];
};
