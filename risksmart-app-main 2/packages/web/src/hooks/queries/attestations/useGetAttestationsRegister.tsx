import type { AttestationRegisterResponse } from '@risksmart-app/trpc/src/types';
import type {
  Attestation_Record_Bool_Exp,
  GetPolicyAttestationRecordsQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetPolicyAttestationRecordsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';

const useAttestationsGraphqlVariables = (args: { userId?: string }) => {
  const whereFilter = useEntityWhereFilter<Attestation_Record_Bool_Exp>(
    Parent_Type_Enum.AttestationRecord
  );

  const userWhere: Attestation_Record_Bool_Exp = {
    UserId: { _eq: args.userId },
  };

  return {
    where: args.userId ? userWhere : whereFilter,
  };
};

/**
 * Maps TRPC attestation record data to match the GraphQL query structure
 */
export function mapTrpcAttestationRecordsToGraphQL(
  trpcData: AttestationRegisterResponse
): GetPolicyAttestationRecordsQuery {
  return {
    attestation_record: trpcData.attestation_record,
  };
}

type UseGetAttestationsRegisterArgs = {
  userId?: string;
};

export const useGetAttestationsRegister = createQueryHook<
  UseGetAttestationsRegisterArgs,
  AttestationRegisterResponse,
  GetPolicyAttestationRecordsQuery
>({
  trpcQueryOptions: (trpc, { userId }) =>
    trpc.frontend.attestation.register.queryOptions({ userId }),
  mapTrpcDataToGraphQL: mapTrpcAttestationRecordsToGraphQL,
  graphqlDocument: GetPolicyAttestationRecordsDocument,
  graphqlVariables: useAttestationsGraphqlVariables,
});
