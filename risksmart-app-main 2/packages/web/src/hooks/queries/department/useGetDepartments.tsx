import type { DepartmentTypeResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetDepartmentsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDepartmentsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetDepartmentsArgs = Record<string, never>;

export const useGetDepartments = createQueryHook<
  UseGetDepartmentsArgs,
  DepartmentTypeResponseRow[],
  GetDepartmentsQuery
>({
  trpcQueryOptions: (trpc) => trpc.frontend.department.allTypes.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ department_type: data }),
  graphqlDocument: GetDepartmentsDocument,
});
