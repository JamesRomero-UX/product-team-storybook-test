import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getAppetiteByIdQueryConfig,
  getAppetiteListQueryConfig,
} from '@risksmart-app/drizzle/src/queries/appetite.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type AppetiteListResponseRow = InferQueryModel<
  'appetite',
  typeof getAppetiteListQueryConfig
>;

export interface AppetiteByIdResponse {
  appetite: InferQueryModel<'appetite', typeof getAppetiteByIdQueryConfig>;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
