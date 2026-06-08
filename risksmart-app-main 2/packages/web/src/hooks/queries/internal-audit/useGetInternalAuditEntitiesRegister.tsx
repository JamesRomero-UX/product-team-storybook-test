import type { InternalAuditEntityRegisterResponse } from '@risksmart-app/trpc/src/types';
import type {
  GetInternalAuditsQuery,
  Internal_Audit_Entity_Bool_Exp,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetInternalAuditsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';

/**
 * Maps TRPC internal audit entities data to match the GraphQL query structure
 */
export function mapTrpcInternalAuditEntitiesToGraphQL(
  trpcData: InternalAuditEntityRegisterResponse | undefined
): GetInternalAuditsQuery | undefined {
  if (!trpcData) {
    return undefined;
  }

  return {
    internal_audit_entity: trpcData.internal_audit_entity,
  };
}

const useInternalAuditsGraphqlVariables = () => {
  const whereFilter = useEntityWhereFilter<Internal_Audit_Entity_Bool_Exp>(
    Parent_Type_Enum.InternalAuditEntity
  );

  return { where: whereFilter };
};

type UseGetInternalAuditEntitiesRegisterArgs = Record<string, never>;

export const useGetInternalAuditEntitiesRegister = createQueryHook<
  UseGetInternalAuditEntitiesRegisterArgs,
  InternalAuditEntityRegisterResponse,
  GetInternalAuditsQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.internalAuditEntity.register.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({
    internal_audit_entity: data.internal_audit_entity,
  }),
  graphqlDocument: GetInternalAuditsDocument,
  graphqlVariables: useInternalAuditsGraphqlVariables,
});
