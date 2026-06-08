import {
  createFieldAndPersist,
  FormFieldOperationError,
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

import { PostSchema } from './schema';

const logger = getLogger();

/**
 * Creates a new for field. Note new fields are always created as custom attribute fields.
 */
export const handler = backendRouteHandler(PostSchema, async (request) => {
  logger.info('Requested to insert field', {
    type: request.input.object.Type,
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

  if (!request.input.object.IsCustomField) {
    throw new BadRequest('Cannot create standard field');
  }

  const formConfiguration = await apiClient.getFormConfiguration({
    where: {
      ParentType: {
        _eq: request.input.object.ParentType,
      },
    },
  });

  const customAttributeSchema =
    formConfiguration.form_configuration?.[0]?.customAttributeSchema;

  // TODO: validate conditions

  try {
    const { fieldId } = await createFieldAndPersist({
      field: {
        parentType: request.input.object.ParentType,
        fieldType: request.input.object.Type,
        label: request.input.object.Label,
        altLabel: request.input.object.AltLabel,
        description: request.input.object.Description,
        options: request.input.object.Options,
        isRequired: request.input.object.Required,
        isHidden: request.input.object.Hidden,
        isReadOnly: request.input.object.ReadOnly,
        defaultValue: request.input.object.DefaultValue,
        conditions: request.input.object.Conditions,
      },
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        Id: fieldId,
      }),
    };
  } catch (ex) {
    if (ex instanceof FormFieldOperationError) {
      throw new BadRequest(ex.message);
    }
    throw ex;
  }
});
