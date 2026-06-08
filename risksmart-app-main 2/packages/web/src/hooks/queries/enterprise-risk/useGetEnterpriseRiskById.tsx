import type { GetEnterpriseRiskByIdResponseRow } from '@risksmart-app/trpc/types/backend/v1/enterprise-risk.types';
import type { GetEnterpriseRiskByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetEnterpriseRiskByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetEnterpriseRiskByIdArgs = {
  id: string;
};

export const useGetEnterpriseRiskById = createQueryHook<
  UseGetEnterpriseRiskByIdArgs,
  GetEnterpriseRiskByIdResponseRow[],
  GetEnterpriseRiskByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.enterpriseRisk.getById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ enterprise_risk: data }),
  graphqlDocument: GetEnterpriseRiskByIdDocument,
  graphqlVariables: ({ id }) => ({ Id: id }),
});
