import {
  deleteFieldAndPersist,
  FormFieldOperationError,
} from '@risksmart-app/form-configuration/src/field-orchestrator';
import type { Conditions } from '@risksmart-app/form-configuration/src/field-types/types';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { BadRequest } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getLogger } from 'src/logger';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { DeleteSchema } from './schema';

const logger = getLogger();
/**
 * Deletes a custom attribute field
 */
export const handler = backendRouteHandler(DeleteSchema, async (request) => {
  logger.info('Requested to delete custom attribute field', {
    fieldId: request.input.object.FieldId,
    parentType: request.input.object.ParentType,
  });
  const hasuraClient = getHasuraBackendClientForAction(request);
  const apiClient = getRisksmartApiClient(hasuraClient);
  const sessionData = getSessionData(request.session_variables);

  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    objectType: ParentTypeEnum.CustomAttributeSchema,
    accessType: AccessTypeEnum.Update,
  });

  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }
  const input = request.input.object;

  const formConfigurationData = await apiClient.getFormConfiguration({
    where: {
      ParentType: {
        _eq: input.ParentType,
      },
    },
  });
  const formConfiguration = formConfigurationData.form_configuration?.[0];

  const customAttributeSchema = formConfiguration?.customAttributeSchema;

  if (!customAttributeSchema) {
    throw new BadRequest('Custom attribute schema not found');
  }
  logger.info('Removing custom attribute field', {
    fieldId: request.input.object.FieldId,
    parentType: request.input.object.ParentType,
  });

  const allFieldConfigurations: {
    fieldId: string;
    label: string;
    description?: string | undefined;
    isRequired: boolean;
    isHidden: boolean;
    isReadOnly: boolean;
    defaultValue?: string | undefined;
    conditions?: Conditions | undefined;
  }[] =
    formConfiguration?.fields_config?.map(
      ({ __typename, FormConfigurationParentType: _1, ...field }) => ({
        fieldId: field.FieldId ?? '',
        label: field.Label ?? '',
        description: field.Description ?? undefined,
        isRequired: field.Required ?? false,
        isHidden: field.Hidden ?? false,
        isReadOnly: field.ReadOnly ?? false,
        defaultValue: field.DefaultValue ?? undefined,
        conditions: field.Conditions ?? undefined,
      })
    ) ?? [];

  try {
    await deleteFieldAndPersist({
      field: {
        fieldId: input.FieldId,
        parentType: input.ParentType,
      },
      currentCustomAttributeSchema: {
        id: customAttributeSchema.Id,
        schema: customAttributeSchema.Schema,
        uiSchema: customAttributeSchema.UiSchema,
      },
      allFieldConfigurations,
      persist: async ({
        schemaId,
        parentType,
        formFieldConfigurations,
        schema,
        uiSchema,
        fieldsToDelete,
      }) => {
        await apiClient.insertFormFieldConfiguration({
          SchemaId: schemaId,
          ParentType: parentType,
          FormFieldConfigurations: formFieldConfigurations,
          Schema: schema,
          UiSchema: uiSchema,
          FieldsToDelete: fieldsToDelete,
        });
      },
    });
  } catch (ex) {
    if (ex instanceof FormFieldOperationError) {
      throw new BadRequest(ex.message);
    }
    throw ex;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: input.FieldId,
    }),
  };
});
