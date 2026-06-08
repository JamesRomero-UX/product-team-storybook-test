import type {
  GetThirdPartyResponsesByThirdPartySubscription,
  Third_Party_Response_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type ThirdPartyResponseFields = CollectionData<
  GetThirdPartyResponsesByThirdPartySubscription['third_party_response'][number]
>;

export type ThirdPartyResponseRegisterFields = ThirdPartyResponseFields & {
  UserEmail: string;
  Questionnaire: string;
  QuestionnaireVersion: string;
  CreatedByFriendlyName: string;
  ModifiedByFriendlyName: string;
  Status: Third_Party_Response_Status_Enum;
  StartDate: string;
  ExpiresAt: string;
};
