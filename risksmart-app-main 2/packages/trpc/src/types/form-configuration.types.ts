import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getFormConfigurationForType } from '@risksmart-app/drizzle/src/queries/utils';

export type GetFormConfigurationResponseRow = InferQueryModel<
  'form_configuration',
  typeof getFormConfigurationForType
>;

/**
 * Response from creating a form field
 */
export interface CreateFormFieldResponse {
  Id: string;
}

/**
 * Response from updating a form field
 */
export interface UpdateFormFieldResponse {
  Id: string;
}
