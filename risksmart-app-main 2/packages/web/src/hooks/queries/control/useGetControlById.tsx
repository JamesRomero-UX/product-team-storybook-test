import type { ControlByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetControlByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetControlByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetControlByIdArgs = {
  controlId: string;
};

export const useGetControlById = createQueryHook<
  UseGetControlByIdArgs,
  ControlByIdResponseRow[],
  GetControlByIdQuery
>({
  trpcQueryOptions: (trpc, { controlId }) =>
    trpc.frontend.control.controlById.queryOptions({ controlId }),
  mapTrpcDataToGraphQL: (data) => ({ control: data }),
  graphqlDocument: GetControlByIdDocument,
  graphqlVariables: ({ controlId }) => ({ _eq: controlId }),
});
