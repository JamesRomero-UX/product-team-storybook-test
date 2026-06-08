import { createContext, useContext } from 'react';

export type ExportFn = {
  id: string;
  text: string;
  fn: () => void;
};

type WidgetContextState = {
  widgetId: string;
  exportFns?: ExportFn[];
  setExportFns?: (exportFns: ExportFn[]) => void;
};

const WidgetContext = createContext<null | WidgetContextState>(null);

export const WidgetContextProvider = WidgetContext.Provider;

export const useWidgetContext = () => {
  return useContext(WidgetContext);
};
