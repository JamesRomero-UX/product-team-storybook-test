import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getControlListQueryConfig } from '@risksmart-app/drizzle/src/queries/control.query';

import type { ControlByIdResponseRow } from '../../control.types';
import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type ControlListResponseRow = InferQueryModel<
  'control',
  typeof getControlListQueryConfig
>;

export interface ControlByIdResponse {
  control: ControlByIdResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
