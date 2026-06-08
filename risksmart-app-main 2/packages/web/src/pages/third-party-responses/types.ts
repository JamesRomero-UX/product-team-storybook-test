import type { GetThirdPartyResponsesSubscription } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type ThirdPartyResponseFields = CollectionData<
  GetThirdPartyResponsesSubscription['third_party_response'][number]
>;

export type ThirdPartyResponseRegisterFields = ThirdPartyResponseFields & {
  StatusLabelled: string;
  ThirdPartyName: string;
  QuestionnaireTitle: string;
  QuestionnaireVersion: string;
  Respondents: string;
};
