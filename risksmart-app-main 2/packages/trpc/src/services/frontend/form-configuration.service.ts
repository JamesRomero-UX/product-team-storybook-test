import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
import type {
  CreateFormFieldRequest,
  DeleteFormFieldRequest,
  UpdateFormFieldRequest,
} from '@risksmart-app/events/src/types/request-types';
import { FORM_CONFIG_RESOURCE_TYPE_MAP } from '@risksmart-app/form-configuration/src/formConfigResourceTypeMap';
import { bulkCheck } from '@risksmart-app/permitio/src/permit';

import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import type {
  CreateFormFieldResponse,
  GetFormConfigurationResponseRow,
  UpdateFormFieldResponse,
} from '../../types/index';
import { mapDataLayerError } from '../../utils/error-mapping';
import type {
  FormConfigurationService,
  ServiceContext,
} from '../service.types';

export class FormConfigurationServiceImpl implements FormConfigurationService {
  async getByParentTypes(
    ctx: ServiceContext,
    parentTypes: ParentType[]
  ): Promise<GetFormConfigurationResponseRow[]> {
    try {
      const { data } = await dataLayerApiClient.getFormConfigurations(
        toApiContext(ctx),
        {
          parentTypes,
        }
      );

      return data;
    } catch (error) {
      mapDataLayerError(error);
    }
  }

  async createFormField(
    ctx: ServiceContext,
    input: CreateFormFieldRequest
  ): Promise<CreateFormFieldResponse> {
    return executeAsyncRequest(ctx, input, {
      requestType: 'CREATE_FORM_FIELD',
      buildRequestBody: (input) => ({
        IsCustomField: input.IsCustomField,
        ParentType: input.ParentType,
        Label: input.Label,
        AltLabel: input.AltLabel ?? undefined,
        Description: input.Description ?? null,
        Type: input.Type,
        Options: input.Options,
        Required: input.Required,
        Hidden: input.Hidden,
        ReadOnly: input.ReadOnly,
        DefaultValue: input.DefaultValue ?? null,
        Conditions: input.Conditions ?? undefined,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createFormField(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to create form fields',
        400: 'Invalid form field configuration',
      },
    });
  }

  async updateFormField(
    ctx: ServiceContext,
    input: UpdateFormFieldRequest
  ): Promise<UpdateFormFieldResponse> {
    return executeAsyncRequest(ctx, input, {
      requestType: 'UPDATE_FORM_FIELD',
      buildRequestBody: (input) => ({
        ParentType: input.ParentType,
        FieldId: input.FieldId,
        IsCustomField: input.IsCustomField,
        Label: input.Label ?? null,
        AltLabel: input.AltLabel ?? undefined,
        Description: input.Description ?? null,
        Options: input.Options,
        Required: input.Required,
        Hidden: input.Hidden,
        ReadOnly: input.ReadOnly,
        DefaultValue: input.DefaultValue ?? null,
        Conditions: input.Conditions ?? undefined,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.updateFormField(
          toApiContext(ctx),
          input,
          correlationId
        ),
      successStatus: 200,
      errorMessages: {
        403: 'You do not have permission to update form fields',
        400: 'Invalid form field configuration',
        404: 'Form field not found',
      },
    });
  }

  async deleteFormField(
    ctx: ServiceContext,
    input: DeleteFormFieldRequest
  ): Promise<void> {
    await executeAsyncRequest(ctx, input, {
      requestType: 'DELETE_FORM_FIELD',
      buildRequestBody: (input) => ({
        ParentType: input.ParentType,
        FieldId: input.FieldId,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.deleteFormField(
          toApiContext(ctx),
          input,
          correlationId
        ),
      successStatus: 204,
      errorMessages: {
        403: 'You do not have permission to delete form fields',
        404: 'Form field not found',
      },
    });
  }

  async canUpdateFormConfig(
    ctx: ServiceContext,
    parentType: ParentType
  ): Promise<boolean> {
    const resourceType = FORM_CONFIG_RESOURCE_TYPE_MAP[parentType];

    if (!resourceType) {
      return false;
    }
    // Check permission for the specific resource type's form configuration
    const permitted = await bulkCheck(
      [
        {
          resourceName: `${resourceType}_form_configuration`,
          action: 'update' as const,
        },
      ],
      ctx.userId,
      ctx.orgId
    );

    return permitted.length > 0;
  }
}
