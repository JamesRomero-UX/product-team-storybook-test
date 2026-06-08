import type { ControlsBasicResponse } from '@risksmart-app/trpc/src/types';
import type { GetControlsBasicQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetControlsBasicDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetControlsBasicArgs = Record<string, never>;

export const useGetControlsBasic = createQueryHook<
  UseGetControlsBasicArgs,
  ControlsBasicResponse,
  GetControlsBasicQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.control.controlsBasic.queryOptions(),
  mapTrpcDataToGraphQL: (data) => data,
  graphqlDocument: GetControlsBasicDocument,
});
