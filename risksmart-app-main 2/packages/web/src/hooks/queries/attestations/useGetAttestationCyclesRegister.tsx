import type { AttestationCycleRegisterResponse } from '@risksmart-app/trpc/src/types';
import type { GetAttestationCycleRegisterQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAttestationCycleRegisterDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

/**
 * Maps TRPC attestationCycle data to match the GraphQL query structure
 */
const mapTrpcAttestationCyclesToGraphQL = (
  trpcData: AttestationCycleRegisterResponse
): GetAttestationCycleRegisterQuery => {
  return {
    attestation_cycle: trpcData.attestation_cycle.map((cycle) => {
      const document = cycle.document_file?.parent
        ? { ...cycle.document_file?.parent }
        : null;

      const documentFile = cycle.document_file
        ? { ...cycle.document_file, parent: document }
        : null;

      if (!documentFile) {
        throw new Error('Document file is missing in attestation cycle data');
      }

      return {
        ...cycle,
        records: cycle.attestation_record,
        parent: documentFile,
      };
    }),
  };
};

export const useGetAttestationCyclesRegister = createQueryHook<
  Record<string, never>,
  AttestationCycleRegisterResponse,
  GetAttestationCycleRegisterQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.attestationCycle.register.queryOptions(),
  mapTrpcDataToGraphQL: mapTrpcAttestationCyclesToGraphQL,
  graphqlDocument: GetAttestationCycleRegisterDocument,
});
