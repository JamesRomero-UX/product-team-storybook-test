import { create } from 'zustand';

interface WidgetExport {
  id: string;
  exportFn: () => Promise<HTMLCanvasElement | undefined>;
}

interface BulkExportState {
  widgetExports: WidgetExport[];
  addWidgetExport: (widgetExport: WidgetExport) => void;
  removeWidgetExport: (id: string) => void;
  clearWidgetExports: () => void;
}

export const useDashboardBulkExportStore = create<BulkExportState>((set) => ({
  widgetExports: [],
  addWidgetExport: (widgetExport) => {
    set((state) => ({
      widgetExports: [
        ...state.widgetExports.filter((item) => item.id !== widgetExport.id),
        widgetExport,
      ],
    }));
  },
  removeWidgetExport: (id) => {
    set((state) => ({
      widgetExports: state.widgetExports.filter(
        (exportItem) => exportItem.id !== id
      ),
    }));
  },
  clearWidgetExports: () => set({ widgetExports: [] }),
}));
