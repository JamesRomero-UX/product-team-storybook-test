import type { AttestationStatusResponseRow } from '@risksmart-app/trpc/types/attestation-record.types';
import type { GetAttestationStatusQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAttestationStatusDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetAttestationStatusArgs = {
  parentId: string;
  userId: string;
};

export const useGetAttestationStatus = createQueryHook<
  UseGetAttestationStatusArgs,
  AttestationStatusResponseRow[],
  GetAttestationStatusQuery
>({
  trpcQueryOptions: (trpc, { parentId, userId }) =>
    trpc.frontend.attestation.status.queryOptions({ parentId, userId }),
  mapTrpcDataToGraphQL: (data) => ({ attestation_record: data }),
  graphqlDocument: GetAttestationStatusDocument,
  graphqlVariables: ({ parentId, userId }) => ({
    ParentId: parentId,
    UserId: userId,
  }),
});
