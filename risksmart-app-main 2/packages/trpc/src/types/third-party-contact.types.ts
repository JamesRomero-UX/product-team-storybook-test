import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getThirdPartyContactByIdQueryConfig,
  getThirdPartyContactsQueryConfig,
} from '@risksmart-app/drizzle/src/queries/third-party-contact.query';

export type ThirdPartyContactRow = InferQueryModel<
  'third_party_contact',
  typeof getThirdPartyContactsQueryConfig
>;

export type ThirdPartyContactByIdRow = InferQueryModel<
  'third_party_contact',
  typeof getThirdPartyContactByIdQueryConfig
>;
