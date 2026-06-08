import type { FormConfigResponse } from '../../clients/client.interface';
import type { BaseQuerySchema } from '../../schemas/route-query.schema';
import type { TransformCustomFieldsFn } from '../../transformers/common/custom-fields.transformer';
import type { AuthenticatedRequest } from '../../types/request';
import type { DataEntityTransformFn } from '../../types/transform';

interface ProcessItemResultParams<TIn extends Record<string, unknown>, TOut> {
  result: {
    readonly data: TIn;
    readonly form_configuration?: FormConfigResponse | null;
  } | null;
  dataTransformFn: DataEntityTransformFn<TIn, TOut>;
  req: AuthenticatedRequest;
  id: string;
  basePath: string;
  linkId?: string;
  hasCustomFields?: boolean;
}

interface ProcessItemResponsesProps {
  querySchema: BaseQuerySchema;
  transformCustomFieldsFn: TransformCustomFieldsFn;
}

export const processItemResponses = ({
  querySchema,
  transformCustomFieldsFn,
}: ProcessItemResponsesProps) => {
  // processes a single item response and adds customFields if provided.
  const processItemResponse = <TIn extends Record<string, unknown>, TOut>(
    params: ProcessItemResultParams<TIn, TOut>
  ) => {
    const {
      result,
      dataTransformFn,
      req,
      id,
      basePath,
      linkId,
      hasCustomFields = true,
    } = params;

    if (!result) {
      req.requestLogger.warn(
        {
          event: 'entity_not_found',
          id,
        },
        'entity not returned from service'
      );

      return null;
    }

    const { data: queryData } = querySchema.safeParse(req.query);

    const expandedFields = queryData?.expand?.split(',') ?? [];
    let customFields = {};
    if (
      result.form_configuration &&
      result.data.CustomAttributeData &&
      hasCustomFields
    ) {
      try {
        customFields = transformCustomFieldsFn(
          result.data.CustomAttributeData,
          result.form_configuration,
          { expandMeta: expandedFields.includes('customFields') }
        );
      } catch (error) {
        req.requestLogger.error(
          { event: 'id_entity_custom_fields_error', error, id },
          'Error while trying to transform custom fields'
        );
      }
    }

    try {
      const transformedData = dataTransformFn(result.data, {
        basePath,
        linkId,
      });

      return {
        ...transformedData,
        ...(hasCustomFields && { customFields }),
      };
    } catch (error) {
      req.requestLogger.error(
        { event: 'entity_response_data_error', error, id },
        'Error while trying to transform response entity data'
      );
      throw new Error('unable to transform response data for entity');
    }
  };

  return {
    processItemResponse,
  };
};

export type ProcessItemResponses = ReturnType<typeof processItemResponses>;
