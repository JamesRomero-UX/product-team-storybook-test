import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  DataImportBoolExp,
  DataImportOrderBy,
} from '../../../generated/graphql';
import {
  GetDataImportsDocument,
  InsertDataImportErrorsDocument,
  SetDataImportStatusDocument,
  SetDataImportValidatingDocument,
} from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, RepositoryOptions } from '../types';

type Where = DataImportBoolExp;
type OrderBy = DataImportOrderBy;

export const DataImportRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetDataImportsDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.data_import;
    },
    async setToValidating(
      variables: VariablesOf<typeof SetDataImportValidatingDocument>
    ) {
      const { data, errors } = await client.mutate({
        mutation: SetDataImportValidatingDocument,
        variables,
      });
      if (
        !data?.delete_data_import_error ||
        !data?.update_data_import ||
        errors
      ) {
        throw new Error(JSON.stringify(errors));
      }

      return data.update_data_import.affected_rows;
    },

    async setToFailed(
      variables: VariablesOf<typeof InsertDataImportErrorsDocument>
    ) {
      const { data, errors } = await client.mutate({
        mutation: InsertDataImportErrorsDocument,
        variables,
      });
      if (!data?.insert_data_import_error || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_data_import_error.affected_rows;
    },

    async setImportStatus(
      variables: VariablesOf<typeof SetDataImportStatusDocument>
    ) {
      const { data, errors } = await client.mutate({
        mutation: SetDataImportStatusDocument,
        variables,
      });
      if (!data?.update_data_import || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.update_data_import.affected_rows;
    },
  };
};
