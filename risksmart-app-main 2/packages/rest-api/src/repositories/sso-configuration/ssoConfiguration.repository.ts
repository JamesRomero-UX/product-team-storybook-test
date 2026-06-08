import type { VariablesOf } from '@graphql-typed-document-node/core';
import { getHasuraBackendClient } from 'src/backendGraphqlClient';

import type { SsoConfigurationSetInput } from '../../../generated/graphql';
import {
  DeleteSsoConfigurationByConnectionIdDocument,
  GetSsoConfigurationsDocument,
  InsertSsoConfigurationDocument,
  UpdateSsoConfigurationByConnectionIdDocument,
} from '../../../generated/graphql';
import type { RepositoryOptions } from '../types';

export type CreateInput = VariablesOf<
  typeof InsertSsoConfigurationDocument
>['object'];

export const ssoConfigurationRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findAll() {
      const { data, errors } = await client.query({
        query: GetSsoConfigurationsDocument,
        variables: {},
      });
      if (errors) {
        throw errors[0];
      }

      return data.sso_configuration;
    },

    async create(object: CreateInput) {
      const { data, errors } = await client.mutate({
        mutation: InsertSsoConfigurationDocument,
        variables: { object },
      });
      if (!data?.insert_sso_configuration_one || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_sso_configuration_one;
    },

    async updateByConnectionId(
      connectionId: string,
      set: SsoConfigurationSetInput
    ) {
      const { data, errors } = await client.mutate({
        mutation: UpdateSsoConfigurationByConnectionIdDocument,
        variables: { connectionId, set },
      });
      if (!data?.update_sso_configuration || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.update_sso_configuration.returning[0];
    },

    async deleteByConnectionId(connectionId: string) {
      const { data, errors } = await client.mutate({
        mutation: DeleteSsoConfigurationByConnectionIdDocument,
        variables: { connectionId },
      });
      if (!data?.delete_sso_configuration || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.delete_sso_configuration.returning[0];
    },
  };
};
