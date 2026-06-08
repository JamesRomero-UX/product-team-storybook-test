import type { DocumentByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetAttestationConfigQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAttestationConfigDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetAttestationConfigArgs = {
  parentDocumentId: string;
};

export const useGetAttestationConfig = createQueryHook<
  UseGetAttestationConfigArgs,
  DocumentByIdResponseRow[],
  GetAttestationConfigQuery
>({
  trpcQueryOptions: (trpc, { parentDocumentId }) =>
    trpc.frontend.document.documentById.queryOptions({
      documentId: parentDocumentId,
    }),
  mapTrpcDataToGraphQL: (data) => ({
    attestation_config: data[0]?.attestationConfig
      ? [data[0].attestationConfig]
      : [],
    document_file: data[0]?.documentFiles ?? [],
  }),
  graphqlDocument: GetAttestationConfigDocument,
  graphqlVariables: ({ parentDocumentId }) => ({ id: parentDocumentId }),
});
