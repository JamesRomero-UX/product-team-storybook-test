import type { ControlGroupResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetControlGroupByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetControlGroupByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetControlGroupByIdArgs = {
  controlGroupId: string;
};

export const useGetControlGroupById = createQueryHook<
  UseGetControlGroupByIdArgs,
  ControlGroupResponseRow[],
  GetControlGroupByIdQuery
>({
  trpcQueryOptions: (trpc, { controlGroupId }) =>
    trpc.frontend.controlGroup.controlGroupById.queryOptions({
      controlGroupId,
    }),
  mapTrpcDataToGraphQL: (data) => ({ control_group: data }),
  graphqlDocument: GetControlGroupByIdDocument,
  graphqlVariables: ({ controlGroupId }) => ({ _eq: controlGroupId }),
});
