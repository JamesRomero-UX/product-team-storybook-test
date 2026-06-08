import type { GetDataImportErrorsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type DataImportErrorFields = CollectionData<
  GetDataImportErrorsQuery['data_import_error'][number]
>;
