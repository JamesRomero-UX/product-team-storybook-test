import type { ThirdPartyContactRow } from '@risksmart-app/trpc/src/types';
import type { GetThirdPartyContactsByThirdPartyIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetThirdPartyContactsByThirdPartyIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetThirdPartyContactsArgs = {
  thirdPartyId: string;
  includeRevoked?: boolean;
};

/**
 * Maps a TRPC contact to match the GraphQL query structure
 */
function mapTrpcContactToGraphQL(
  contact: ThirdPartyContactRow
): GetThirdPartyContactsByThirdPartyIdQuery['third_party_contact'][number] {
  return {
    Id: contact.Id,
    ThirdPartyId: contact.ThirdPartyId,
    Email: contact.Email,
    Name: contact.Name,
    JobTitle: contact.JobTitle,
    IsRevoked: contact.IsRevoked,
    PasswordSetAtTimestamp: contact.PasswordSetAtTimestamp,
    user: contact.user,
  };
}

/**
 * Maps TRPC contacts data to match the GraphQL query structure
 * Exported for use by data sources
 */
export function mapTrpcContactsToGraphQL(
  trpcData: { contacts: ThirdPartyContactRow[] } | undefined
): GetThirdPartyContactsByThirdPartyIdQuery | undefined {
  if (!trpcData) {
    return undefined;
  }

  return {
    third_party_contact: trpcData.contacts.map(mapTrpcContactToGraphQL),
  };
}

export const useGetThirdPartyContacts = createQueryHook<
  UseGetThirdPartyContactsArgs,
  { contacts: ThirdPartyContactRow[] },
  GetThirdPartyContactsByThirdPartyIdQuery
>({
  trpcQueryOptions: (trpc, { thirdPartyId, includeRevoked = false }) =>
    trpc.frontend.thirdPartyContact.list.queryOptions({
      thirdPartyId,
      isIncludingRevoked: includeRevoked,
    }),
  mapTrpcDataToGraphQL: (data) => ({
    third_party_contact: data.contacts.map(mapTrpcContactToGraphQL),
  }),
  graphqlDocument: GetThirdPartyContactsByThirdPartyIdDocument,
  graphqlVariables: ({ thirdPartyId }) => ({ ThirdPartyId: thirdPartyId }),
  // GraphQL returns all contacts; filter out revoked ones client-side when needed
  mapGraphQLData: (data, { includeRevoked = false }) => ({
    ...data,
    third_party_contact: includeRevoked
      ? data.third_party_contact
      : data.third_party_contact.filter((c) => !c.IsRevoked),
  }),
});
