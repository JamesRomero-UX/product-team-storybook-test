import type { ActionRegisterResponse } from '@risksmart-app/trpc/src/types';
import type {
  Action_Bool_Exp,
  GetActionsQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetActionsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';

export const mapTrpcActionsToGraphQL = (
  trpcData: ActionRegisterResponse
): GetActionsQuery => ({ action: trpcData.action });

const useActionsGraphqlVariables = () => {
  const whereFilter = useEntityWhereFilter<Action_Bool_Exp>(
    Parent_Type_Enum.Action
  );

  return { where: whereFilter };
};

type UseGetActionsRegisterArgs = {
  parentId?: string;
  tagTypeIds?: string[];
  departmentTypeIds?: string[];
};

export const useGetActionsRegister = createQueryHook<
  UseGetActionsRegisterArgs,
  ActionRegisterResponse,
  GetActionsQuery
>({
  trpcQueryOptions: (trpc, args) =>
    trpc.frontend.action.register.queryOptions({
      parentId: args.parentId,
      tagTypeIds: args.tagTypeIds,
      departmentTypeIds: args.departmentTypeIds,
    }),
  mapTrpcDataToGraphQL: mapTrpcActionsToGraphQL,
  graphqlDocument: GetActionsDocument,
  graphqlVariables: useActionsGraphqlVariables,
});
