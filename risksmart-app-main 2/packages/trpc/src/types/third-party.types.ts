import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getThirdPartiesQueryConfig,
  getThirdPartyByIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/third-party.query';

export type ThirdPartyResponseRow = InferQueryModel<
  'third_party',
  typeof getThirdPartiesQueryConfig
>;

export type ThirdPartyWithFilesResponseRow = InferQueryModel<
  'third_party',
  typeof getThirdPartyByIdQueryConfig
>;
