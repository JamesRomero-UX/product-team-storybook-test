import type { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';

import type {
  FormConfigsByParentTypesResponse,
  IClient,
} from '../../clients/client.interface';
import { CustomFieldValidationError } from '../../errors/custom-field.errors';
import { DepartmentValidationError } from '../../errors/department.errors';
import { UserValidationError } from '../../errors/user.errors';
import type { MutateServiceContext } from '../../schemas/common/base.schema';
import type { CustomFieldInput } from '../../schemas/common/custom-fields.schema';
import type { ServiceCallContext } from '../../types/service';
import {
  buildCustomFieldIdLookup,
  createFieldConfigMap,
  resolveCustomFieldDefaults,
  validateCustomFieldValueByKind,
} from '../../utils/custom-fields';
import { logger } from '../../utils/logger';
import type { DepartmentsService } from '../departments/departments.service';
import type { UsersService } from '../users/users.service';

export type SchemaService = ReturnType<typeof schemaService>;

export interface ValidateCustomFieldsOptions {
  customFields: CustomFieldInput[] | undefined;
  formConfigs: FormConfigsByParentTypesResponse['formConfiguration'];
  existingCustomAttributeData: Record<string, unknown> | null | undefined;
  isCreate: boolean;
  ctx: MutateServiceContext;
}

const throwCustomFieldError = (msg: string): never => {
  throw new CustomFieldValidationError(msg);
};

interface MultiselectFieldOptions {
  validateIds: (ids: string[], ctx: MutateServiceContext) => Promise<unknown>;
  knownError: new (...args: never[]) => Error;
  ctx: MutateServiceContext;
}

const handleMultiselectField = async (
  fieldId: string,
  kind: string,
  value: CustomFieldInput['value'],
  options: MultiselectFieldOptions
): Promise<string[]> => {
  const { validateIds, knownError, ctx } = options;
  if (!Array.isArray(value)) {
    return throwCustomFieldError(
      `Custom field ${fieldId} (${kind}) must be a string array`
    );
  }

  if (value.length > 100) {
    return throwCustomFieldError(
      `Custom field ${fieldId} (${kind}) no more than 100 ids`
    );
  }

  if (value.length === 0) {
    return [];
  }

  try {
    await validateIds(value, ctx);

    return [...new Set(value)];
  } catch (err) {
    if (err instanceof knownError) {
      logger.warn(
        { fieldId, error: (err).message },
        `validateAndTransformCustomFields: ${kind} validation failed`
      );
      throwCustomFieldError((err).message);
    }
    throw err;
  }
};

export const schemaService = (
  client: IClient,
  usersService: UsersService,
  departmentsService: DepartmentsService
) => {
  const getResourceSchema = async (
    parentType: (typeof ParentTypes)[keyof typeof ParentTypes],
    ctx: ServiceCallContext
  ): Promise<FormConfigsByParentTypesResponse['formConfiguration']> => {
    const response = await client.getFormConfigsByParentTypes(
      { authorization: ctx.authToken },
      [parentType]
    );

    return response.formConfiguration;
  };

  const validateAndTransformCustomFields = async ({
    customFields,
    formConfigs,
    existingCustomAttributeData,
    isCreate,
    ctx,
  }: ValidateCustomFieldsOptions): Promise<Record<string, unknown> | null> => {
    if (!formConfigs || formConfigs.length === 0) {
      if (customFields && customFields.length > 0) {
        logger.error(
          'validateAndTransformCustomFields: no formConfigs available but customFields were provided'
        );
        throw new CustomFieldValidationError(
          'Custom fields were provided but the schema could not be loaded'
        );
      }
      logger.warn(
        'validateAndTransformCustomFields: no formConfigs available, skipping custom field validation'
      );

      return existingCustomAttributeData ?? null;
    }

    const formConfig = formConfigs[0]!;
    const rawProperties = formConfig.customAttributeSchema?.Schema?.properties;
    const props: Record<string, { enum?: string[]; format?: string }> =
      (rawProperties as Record<string, { enum?: string[]; format?: string }>) ??
      {};

    const fieldConfigMap = createFieldConfigMap(formConfig.fields_config ?? []);

    // Build reverse lookup map
    const idLookup = buildCustomFieldIdLookup(props, fieldConfigMap);

    const inputTransformed: Record<string, unknown> = {};

    // Loop over custom fields and validate the values.
    for (const field of customFields ?? []) {
      const entry = idLookup.get(field.id);
      if (!entry) {
        logger.warn(
          { fieldId: field.id },
          'validateAndTransformCustomFields: unknown custom field id'
        );
        throw new CustomFieldValidationError(
          `Unknown custom field id: ${field.id}`
        );
      }

      const { propKey, kind, schemaProp } = entry;
      const { value } = field;

      if (kind === 'usermultiselect') {
        inputTransformed[propKey] = await handleMultiselectField(
          field.id,
          kind,
          value,
          { validateIds: usersService.validateUserIds, knownError: UserValidationError, ctx }
        );
        continue;
      }

      if (kind === 'departmentmultiselect') {
        inputTransformed[propKey] = await handleMultiselectField(
          field.id,
          kind,
          value,
          { validateIds: departmentsService.validateDepartmentIds, knownError: DepartmentValidationError, ctx }
        );
        continue;
      }

      // Validate field values that do not require a lookup.
      validateCustomFieldValueByKind(field.id, kind, value, {
        schemaProp,
        throwValidationError: throwCustomFieldError,
      });

      inputTransformed[propKey] = value;
    }

    // Handle required fields and default setting.
    const customFieldIds = new Set((customFields ?? []).map((f) => f.id));
    const { defaults, missingRequiredIds } = resolveCustomFieldDefaults(
      props,
      fieldConfigMap,
      customFieldIds,
      isCreate
    );
    if (missingRequiredIds.length > 0) {
      throwCustomFieldError(
        `Required custom fields are missing: ${missingRequiredIds.join(', ')}`
      );
    }

    if (isCreate) {
      return Object.keys(inputTransformed).length === 0 &&
        Object.keys(defaults).length === 0
        ? null
        : { ...defaults, ...inputTransformed };
    }

    // Update: merge with existing
    return { ...(existingCustomAttributeData ?? {}), ...inputTransformed };
  };

  const resolveUpdateCustomAttributeData = async ({
    customFields,
    parentType,
    existingCustomAttributeData,
    ctx,
  }: {
    customFields: CustomFieldInput[] | undefined;
    parentType: (typeof ParentTypes)[keyof typeof ParentTypes];
    existingCustomAttributeData: Record<string, unknown> | null | undefined;
    ctx: MutateServiceContext;
  }): Promise<Record<string, unknown> | null> => {
    if (customFields === undefined) {
      return existingCustomAttributeData ?? null;
    }
    const formConfigs = await getResourceSchema(parentType, ctx);

    return validateAndTransformCustomFields({
      customFields,
      formConfigs,
      existingCustomAttributeData,
      isCreate: false,
      ctx,
    });
  };

  return {
    getResourceSchema,
    validateAndTransformCustomFields,
    resolveUpdateCustomAttributeData,
  };
};
