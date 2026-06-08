import type { AuthenticatedRequest } from '../../types/request';
import type {
  ByIdQueryFetchFn,
  LinkedByIdQueryFetchFn,
} from '../../types/service';
import type { DataEntityTransformFn } from '../../types/transform';
import { providerIdOrUuidList } from '../../utils/schemas';
import type { ProcessItemResponses } from '../response/item.response';

export interface QueryItemRequestConfig {
  basePath: string;
}

interface QueryItemRequestsProps {
  processItemResponses: ProcessItemResponses;
  config: QueryItemRequestConfig;
}

export const queryItemRequests = ({
  config,
  processItemResponses,
}: QueryItemRequestsProps) => {
  // fetches a single linked (nested) item and returns the response.
  const linkedItemByIdFetch = async <TIn extends Record<string, unknown>, TOut>(
    dataFetchFn: LinkedByIdQueryFetchFn<TIn>,
    dataTransformFn: DataEntityTransformFn<TIn, TOut>,
    req: AuthenticatedRequest,
    opts: { linkKeys: string[]; basePath?: string }
  ) => {
    const { linkKeys, basePath = config.basePath } = opts;
    const linkIds: Record<string, string> = {};
    for (const key of linkKeys) {
      if (!req.params[key]) {
        req.requestLogger.error(
          {
            event: 'required_entity_params_not_found',
            params: req.params,
            required: linkKeys,
          },
          'required entity params not found in request parsing'
        );

        return null;
      }
      linkIds[key] = req.params[key];
    }
    const { success } = providerIdOrUuidList.safeParse(Object.values(linkIds));
    if (!success) {
      req.requestLogger.warn(
        {
          event: 'invalid_resource_id',
          ids: linkIds,
        },
        'Invalid resource ids from path params'
      );

      return null;
    }
    const result = await dataFetchFn(linkIds, {
      authToken: req.headers?.authorization || '',
    });

    return processItemResponses.processItemResponse({
      result,
      dataTransformFn,
      req,
      id: JSON.stringify(linkIds),
      basePath,
      linkId: req.params.id,
    });
  };

  const itemByIdFetch = async <TIn extends Record<string, unknown>, TOut>(
    dataFetchFn: ByIdQueryFetchFn<TIn>,
    dataTransformFn: DataEntityTransformFn<TIn, TOut>,
    req: AuthenticatedRequest,
    basePath = config.basePath
  ) => {
    const { id } = req.params;
    if (!id) {
      req.requestLogger.warn(
        {
          event: 'invalid_resource_id',
          id,
        },
        'Invalid resource id from path params'
      );

      return null;
    }
    const result = await dataFetchFn(id, {
      authToken: req.headers?.authorization || '',
    });

    return processItemResponses.processItemResponse({
      result,
      dataTransformFn,
      req,
      id,
      basePath,
    });
  };

  return { linkedItemByIdFetch, itemByIdFetch };
};

export type QueryItemRequests = ReturnType<typeof queryItemRequests>;
