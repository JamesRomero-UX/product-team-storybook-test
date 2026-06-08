import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getThirdPartyQueryConfig } from '@risksmart-app/drizzle/src/queries/third-party.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type ThirdPartyListResponseRow = InferQueryModel<
  'third_party',
  typeof getThirdPartyQueryConfig
>;

export type GetThirdPartyByIdResponseRow = ThirdPartyListResponseRow;

export interface ThirdPartyByIdResponse {
  thirdParty: GetThirdPartyByIdResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
