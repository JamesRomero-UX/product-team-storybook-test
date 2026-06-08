import {
  FormFieldOperationError,
  updateFieldAndPersist,
} from '@risksmart-app/form-configuration/src/field-orchestrator';
import { randomUUID } from 'crypto';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { BadRequest } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getLogger } from 'src/logger';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PutSchema } from './schema';
const logger = getLogger();

export const handler = backendRouteHandler(PutSchema, async (request) => {
  logger.info('Requested to update field', {
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

  const parentType = request.input.object.ParentType;

  const formConfiguration = await apiClient.getFormConfiguration({
    where: {
      ParentType: {
        _eq: parentType,
      },
    },
  });

  const customAttributeSchema =
    formConfiguration.form_configuration?.[0]?.customAttributeSchema;

  try {
    const inputObject = request.input.object;
    let field: Parameters<typeof updateFieldAndPersist>[0]['field'];

    if (inputObject.IsCustomField) {
      const label = inputObject.Label;
      if (typeof label !== 'string' || label.length === 0) {
        throw new BadRequest('Label is required');
      }

      field = {
        fieldId: inputObject.FieldId,
        parentType,
        isCustomField: true,
        label,
        altLabel: inputObject.AltLabel,
        description: inputObject.Description,
        options: inputObject.Options,
        isRequired: inputObject.Required,
        isHidden: inputObject.Hidden,
        isReadOnly: inputObject.ReadOnly,
        defaultValue: inputObject.DefaultValue,
        conditions: inputObject.Conditions,
      };
    } else {
      field = {
        fieldId: inputObject.FieldId,
        parentType,
        isCustomField: false,
        label: inputObject.Label,
        description: inputObject.Description,
        isRequired: inputObject.Required,
        isHidden: inputObject.Hidden,
        isReadOnly: inputObject.ReadOnly,
        defaultValue: inputObject.DefaultValue,
        conditions: inputObject.Conditions,
      };
    }

    await updateFieldAndPersist({
      field,
      currentCustomAttributeSchema: customAttributeSchema
        ? {
            id: customAttributeSchema.Id,
            schema: customAttributeSchema.Schema,
            uiSchema: customAttributeSchema.UiSchema,
          }
        : null,
      generateSchemaId: randomUUID,
      persist: async ({
        schemaId,
        parentType: persistParentType,
        formFieldConfigurations,
        schema,
        uiSchema,
        fieldsToDelete,
      }) => {
        await apiClient.insertFormFieldConfiguration({
          SchemaId: schemaId,
          ParentType: persistParentType,
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
      Id: request.input.object.FieldId,
    }),
  };
});
