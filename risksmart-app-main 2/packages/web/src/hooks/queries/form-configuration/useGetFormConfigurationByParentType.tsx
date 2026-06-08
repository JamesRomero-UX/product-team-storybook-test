import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
import type { GetFormConfigurationResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetFormConfigurationByParentTypeQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetFormConfigurationByParentTypeDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetFormConfigurationByParentTypeArgs = {
  parentTypes: ParentType[];
};

export const useGetFormConfigurationByParentType = createQueryHook<
  UseGetFormConfigurationByParentTypeArgs,
  GetFormConfigurationResponseRow[],
  GetFormConfigurationByParentTypeQuery
>({
  trpcQueryOptions: (trpc, { parentTypes }) =>
    trpc.frontend.formConfiguration.getByParentTypes.queryOptions({
      parentTypes,
    }),
  mapTrpcDataToGraphQL: (data) => ({ form_configuration: data }),
  graphqlDocument: GetFormConfigurationByParentTypeDocument,
  graphqlVariables: ({ parentTypes }) => ({ parentTypes }),
});
