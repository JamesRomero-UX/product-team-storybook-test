import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getConsequencesByIdQueryConfig } from '@risksmart-app/drizzle/src/queries/consequence.query';

import type { ConsequenceByIdResponseRow } from '../../consequence.types';
import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type ConsequenceListResponseRow = InferQueryModel<
  'consequence',
  typeof getConsequencesByIdQueryConfig
>;

export interface ConsequenceByIdResponse {
  consequence: ConsequenceByIdResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
