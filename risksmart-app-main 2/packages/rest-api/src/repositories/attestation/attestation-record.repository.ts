import type { VariablesOf } from '@graphql-typed-document-node/core';

import type {
  AttestationRecordBoolExp,
  AttestationRecordOrderBy,
} from '../../../generated/graphql';
import {
  DeleteAttestationsDocument,
  GetAttestationsDocument,
  InsertAttestationsDocument,
  UpdateAttestationsDocument,
} from '../../../generated/graphql';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import type { FindOptions, Repository, RepositoryOptions } from '../types';

export type OrderBy = AttestationRecordOrderBy;
export type Where = AttestationRecordBoolExp;
export type CreateInput = VariablesOf<
  typeof InsertAttestationsDocument
>['objects'];
export type UpdateInput = VariablesOf<typeof UpdateAttestationsDocument>['set'];

export const AttestationRecordRepository = (opts: RepositoryOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    async findWhere(where: Where, options?: FindOptions<OrderBy>) {
      const { data, errors } = await client.query({
        query: GetAttestationsDocument,
        variables: { where, ...options },
      });
      if (errors) {
        throw errors[0];
      }

      return data.attestation_record;
    },

    async create(objects: CreateInput) {
      const { data, errors } = await client.mutate({
        mutation: InsertAttestationsDocument,
        variables: {
          objects,
        },
      });
      if (!data?.insert_attestation_record || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.insert_attestation_record.returning;
    },

    async update(where: Where, set: UpdateInput) {
      const { data, errors } = await client.mutate({
        mutation: UpdateAttestationsDocument,
        variables: { where, set },
      });
      if (!data?.update_attestation_record || errors) {
        throw new Error(JSON.stringify(errors));
      }

      return data.update_attestation_record.affected_rows;
    },

    async delete(where: Where) {
      await client.mutate({
        mutation: DeleteAttestationsDocument,
        variables: { where },
      });
    },
  } satisfies Repository;
};
