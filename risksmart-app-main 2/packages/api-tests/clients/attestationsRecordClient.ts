import type { VariablesOf } from '@graphql-typed-document-node/core';

import {
  GetAttestationRecordsDocument,
  InsertAttestationRecordsDocument,
  UpdateAttestationRecordsDocument,
} from '../generated/graphql';
import type { TestQueryOptions } from './utils';
import { getContext, getTestClient } from './utils';

export const getAttestationRecords = async (options?: TestQueryOptions) => {
  const { data, errors } = await getTestClient().query({
    context: getContext(options),
    query: GetAttestationRecordsDocument,
  });
  if (errors?.length) {
    console.error(errors);
    throw new Error('Failed to retrieve data');
  }

  return data.attestation_record;
};

export const insertAttestationRecords = async (
  attestations: VariablesOf<typeof InsertAttestationRecordsDocument>['Objects'],
  options?: TestQueryOptions
) =>
  getTestClient().mutate({
    variables: {
      Objects: attestations,
    },
    context: getContext(options),
    mutation: InsertAttestationRecordsDocument,
  });

export const attestRecord = async (id: string, options?: TestQueryOptions) =>
  getTestClient().mutate({
    variables: { Id: id },
    context: getContext(options),
    mutation: UpdateAttestationRecordsDocument,
  });
