import type {
  ControlGroupRegisterResponse,
  ControlGroupRegisterResponseRow,
} from '@risksmart-app/trpc/src/types';
import type { GetControlGroupsFlatQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetControlGroupsFlatDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

const mapTrpcControlGroupToGraphQL = (
  controlGroup: ControlGroupRegisterResponseRow
): GetControlGroupsFlatQuery['control_group'][number] => {
  return {
    ...controlGroup,
    controls_aggregate: {
      aggregate: {
        count: controlGroup.controls.length,
      },
    },
  };
};

export const useGetControlGroupsRegister = createQueryHook<
  Record<string, never>,
  ControlGroupRegisterResponse,
  GetControlGroupsFlatQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.controlGroup.register.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({
    control_group: data.control_group.map((controlGroup) =>
      mapTrpcControlGroupToGraphQL(controlGroup)
    ),
  }),
  graphqlDocument: GetControlGroupsFlatDocument,
});
