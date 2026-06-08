import type {
  GetDataImportByIdQuery,
  GetDataImportsQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type DataImportFields = CollectionData<
  GetDataImportsQuery['data_import'][number]
>;

export type DataImportTableFields = DataImportFields & {
  ModifiedByUserName: null | string;
  CreatedByUserName: null | string;
  StatusLabel: string;
};

export type DataImport = GetDataImportByIdQuery['data_import'][number];
