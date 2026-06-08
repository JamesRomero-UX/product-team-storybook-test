import type { TppGetResponsesSubscription } from '@risksmart-app/web-graphql-client/generated/graphql';

export type ThirdPartyResponse =
  TppGetResponsesSubscription['third_party_response'][0];
