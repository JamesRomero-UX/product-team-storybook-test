import type { ControlGroupsByTitleResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetControlGroupsByTitleQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetControlGroupsByTitleDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetControlGroupsByTitleArgs = {
  title: string;
};

export const useGetControlGroupsByTitle = createQueryHook<
  UseGetControlGroupsByTitleArgs,
  ControlGroupsByTitleResponseRow[],
  GetControlGroupsByTitleQuery
>({
  trpcQueryOptions: (trpc, { title }) =>
    trpc.frontend.controlGroup.controlGroupsByTitle.queryOptions({
      title,
    }),
  mapTrpcDataToGraphQL: (data) => ({ control_group: data }),
  graphqlDocument: GetControlGroupsByTitleDocument,
  graphqlVariables: ({ title }) => ({ title }),
});
