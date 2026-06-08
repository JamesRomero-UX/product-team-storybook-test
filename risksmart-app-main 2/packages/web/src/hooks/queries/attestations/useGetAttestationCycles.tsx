import type { AttestationCycleRecordResponseRow } from '@risksmart-app/trpc/types/attestation-cycle.types';
import type { GetAttestationCyclesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAttestationCyclesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

/**
 * Maps TRPC attestation cycle data to match the GraphQL query structure
 */
const mapTrpcAttestationCyclesToGraphQL = (
  trpcData: AttestationCycleRecordResponseRow[]
): GetAttestationCyclesQuery => {
  return {
    attestation_cycle: trpcData.map((cycle) => {
      const document = cycle.document_file?.parent
        ? { ...cycle.document_file.parent }
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

type UseGetAttestationCyclesArgs = {
  documentId: string;
};

export const useGetAttestationCycles = createQueryHook<
  UseGetAttestationCyclesArgs,
  AttestationCycleRecordResponseRow[],
  GetAttestationCyclesQuery
>({
  trpcQueryOptions: (trpc, { documentId }) =>
    trpc.frontend.attestationCycle.byDocumentId.queryOptions({ documentId }),
  mapTrpcDataToGraphQL: mapTrpcAttestationCyclesToGraphQL,
  graphqlDocument: GetAttestationCyclesDocument,
  graphqlVariables: ({ documentId }) => ({
    where: {
      parent: { ParentDocumentId: { _eq: documentId } },
    },
  }),
});
