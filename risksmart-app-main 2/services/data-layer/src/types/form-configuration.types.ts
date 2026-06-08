import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getFormConfigurationQueryConfig } from '@risksmart-app/drizzle/src/queries/form-configuration.query';

export type FormConfigurationRow = InferQueryModel<
  'form_configuration',
  typeof getFormConfigurationQueryConfig
>;
