import type { PersistFormFieldConfigurationArgs } from '@risksmart-app/form-configuration/src/field-persistence';

import type { FormFieldRepository } from '../repositories/form-field-repository';

/**
 * Dependencies injected into form field processors
 */
export interface FormFieldProcessorDependencies {
  formFieldRepository: FormFieldRepository;
}

/**
 * Input for the form field persist operation
 * Extends the form-configuration PersistFormFieldConfigurationArgs with user context
 */
export interface FormFieldPersistInput extends PersistFormFieldConfigurationArgs {
  userId: string;
  orgKey: string;
}

/**
 * Response from form field create/update/delete operations
 */
export interface FormFieldOperationResponse {
  Id: string;
}
