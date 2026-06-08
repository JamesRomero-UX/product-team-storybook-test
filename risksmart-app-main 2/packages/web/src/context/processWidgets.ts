import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { getWidgets as getMyWidgets } from '../pages/dashboards/my-items/widgets';
import type { StoredWidgetPlacement } from '../pages/dashboards/types';
import { getWidgets as getDefaultWidgets } from '../pages/dashboards/widgets';

const isUuid = (uuid: string) => {
  return z.string().uuid().safeParse(uuid).success;
};

/**
 * ensure that all widgets have a unique ID, and that the widgetType is set
 * this is a migration step for the previous version of the dashboard preferences
 * @param widgets
 * @returns
 */
export const processWidgets = (widgets: StoredWidgetPlacement[]) => {
  const defaultWidgets = { ...getDefaultWidgets(), ...getMyWidgets() };

  return widgets.map((widget) => {
    if (!isUuid(widget.id)) {
      const definition = defaultWidgets[widget.id];

      const storedWidget: StoredWidgetPlacement = {
        ...widget,
        settings: widget.settings ?? definition.settings,
        widgetType: widget.id,
        id: uuidv4(),
      };

      return storedWidget;
    }

    const definition = defaultWidgets[widget.widgetType];

    return { ...widget, settings: widget.settings ?? definition.settings };
  });
};
