import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  AttestationConfigBoolExp,
  AttestationConfigOrderBy,
} from '../../../generated/graphql';
import {
  DeleteAttestationConfigsDocument,
  GetAttestationConfigsDocument,
  InsertAttestationConfigsDocument,
  UpdateAttestationConfigsDocument,
} from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, Repository, RepositoryOptions } from '../types';

export type OrderBy = AttestationConfigOrderBy;
export type Where = AttestationConfigBoolExp;
export type CreateInput = VariablesOf<
  typeof InsertAttestationConfigsDocument
>['objects'];
export type UpdateInput = VariablesOf<typeof UpdateAttestationConfigsDocument>;

export const AttestationConfigRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetAttestationConfigsDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.attestation_config;
    },

    async create(objects: CreateInput) {
      const { data, errors } = await client.mutate({
        mutation: InsertAttestationConfigsDocument,
        variables: {
          objects,
        },
      });
      if (!data?.insert_attestation_config || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_attestation_config.returning;
    },

    async update(object: UpdateInput) {
      const { data, errors } = await client.mutate({
        mutation: UpdateAttestationConfigsDocument,
        variables: object,
      });
      if (!data?.insert_attestation_config_one || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_attestation_config_one;
    },

    async delete(where: Where) {
      await client.mutate({
        mutation: DeleteAttestationConfigsDocument,
        variables: { where },
      });
    },
  } satisfies Repository;
};
