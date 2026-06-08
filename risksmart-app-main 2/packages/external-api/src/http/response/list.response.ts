import type { QueryMetaDataResponse } from '../../schemas/route-query.schema';
import type { TransformPageInfoData } from '../../transformers/common/page-info.transformer';
import type { AuthenticatedRequest } from '../../types/request';
import type { DateTimeUuidMetadata, Metadata } from '../../types/service';
import type { ListDataTransformFn } from '../../types/transform';

interface ProcessListResultParams<TIn, TOut> {
  result: {
    readonly metadata: Metadata | DateTimeUuidMetadata;
    readonly data: TIn;
  };
  dataTransformFn: ListDataTransformFn<TIn, TOut>;
  req: AuthenticatedRequest;
  pageSize: number | null | undefined;
  hasBeforeCursor: boolean;
  basePath: string;
  linkId?: string;
}

interface ListResponsesProps {
  pageDataTransformer: TransformPageInfoData;
}

export const processListResponses = ({
  pageDataTransformer,
}: ListResponsesProps) => {
  // processes a list of items result, and adding pageInfo to response.
  const processListResponse = <TIn, TOut>(
    params: ProcessListResultParams<TIn, TOut>
  ): { data: TOut; pageInfo: QueryMetaDataResponse } => {
    const {
      result,
      dataTransformFn,
      req,
      pageSize,
      hasBeforeCursor,
      basePath,
      linkId,
    } = params;
    const resourceName = req.baseUrl.replace(basePath, '').replace(/^\//, '');
    try {
      const responseData = dataTransformFn(result, {
        basePath,
        linkId,
        resourceName,
      });

      return {
        data: responseData,
        pageInfo: pageDataTransformer(
          {
            ...result.metadata,
            pageSize: pageSize ?? undefined,
          },
          {
            req,
            isForward: !hasBeforeCursor,
          }
        ),
      };
    } catch (error) {
      req.requestLogger.error(
        { event: 'list_response_data_error', error },
        'Error while trying to transform response list data'
      );
      throw new Error('unable to transform response data for list');
    }
  };

  return {
    processListResponse,
  };
};

export type ProcessListResponses = ReturnType<typeof processListResponses>;
