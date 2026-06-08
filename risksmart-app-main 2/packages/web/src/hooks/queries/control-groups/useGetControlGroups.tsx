import type { ControlGroupsResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetControlGroupsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetControlGroupsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetControlGroupsArgs = Record<string, never>;

export const useGetControlGroups = createQueryHook<
  UseGetControlGroupsArgs,
  ControlGroupsResponseRow[],
  GetControlGroupsQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.controlGroup.controlGroups.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ control_group: data }),
  graphqlDocument: GetControlGroupsDocument,
});
