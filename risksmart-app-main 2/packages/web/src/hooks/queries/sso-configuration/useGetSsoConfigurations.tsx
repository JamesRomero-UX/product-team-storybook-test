import type { SsoConfigurationRow } from '@risksmart-app/trpc/types/sso-configuration.types';
import type { GetSsoConfigurationsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetSsoConfigurationsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

export type SsoConfiguration =
  GetSsoConfigurationsQuery['sso_configuration'][number];

export const useGetSsoConfigurations = createQueryHook<
  void,
  SsoConfigurationRow[],
  GetSsoConfigurationsQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.ssoConfiguration.list.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ sso_configuration: data }),
  graphqlDocument: GetSsoConfigurationsDocument,
});
