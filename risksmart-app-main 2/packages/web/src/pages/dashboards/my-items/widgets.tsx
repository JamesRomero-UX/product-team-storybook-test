import type { WidgetDefinition } from '../types';

let privateWidgets: Record<string, WidgetDefinition>;

export const setWidgets = (widgets: Record<string, WidgetDefinition>) => {
  privateWidgets = widgets;
};

export const getWidgets = () => {
  if (!privateWidgets) {
    throw new Error('Must call setWidgets first!');
  }

  return privateWidgets;
};
