import type {
  FormConfigurationBoolExp,
  FormConfigurationOrderBy,
} from '../../../generated/graphql';
import { getBackendRestApiClient } from '../getBackendRestApiClient';
import type { FindOptions, RepositoryOptions } from '../types';

type Where = FormConfigurationBoolExp;
type OrderBy = FormConfigurationOrderBy;

export const FormConfigurationRepository = (opts: RepositoryOptions) => {
  const client = getBackendRestApiClient(opts);

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      return client.getFormConfiguration({ where, ...options });
    },
  };
};
