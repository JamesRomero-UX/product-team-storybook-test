import type { ApolloError } from '@apollo/client';
import type { DataExportOneOffExportQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { create } from 'zustand/index';

type DataExportState = {
  dataExportLoading: boolean;
  dataExportResult: DataExportOneOffExportQuery | undefined;
  dataExportError: ApolloError | undefined;
  setDataExportLoading: (loading: boolean) => void;
  setDataExportResult: (
    result: DataExportOneOffExportQuery | undefined
  ) => void;
  setDataExportError: (error: ApolloError | undefined) => void;
  resetDataExport: () => void;
};

const useDataExportStore = create<DataExportState>((set) => ({
  dataExportLoading: false,
  dataExportResult: undefined,
  dataExportError: undefined,
  setDataExportLoading: (loading) => set({ dataExportLoading: loading }),
  setDataExportResult: (result) => set({ dataExportResult: result }),
  setDataExportError: (error) => set({ dataExportError: error }),
  resetDataExport: () => {
    set({ dataExportLoading: false });
    set({ dataExportResult: undefined });
    set({ dataExportError: undefined });
  },
}));

export default useDataExportStore;
