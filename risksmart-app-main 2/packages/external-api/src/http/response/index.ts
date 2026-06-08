import { baseQuerySchema } from '../../schemas/route-query.schema';
import { transformCustomFields } from '../../transformers/common/custom-fields.transformer';
import { transformPageInfoData } from '../../transformers/common/page-info.transformer';
import { processItemResponses } from './item.response';
import { processListResponses } from './list.response';

export const createProcessItemResponse = () =>
  processItemResponses({
    transformCustomFieldsFn: transformCustomFields,
    querySchema: baseQuerySchema,
  });

export const createProcessItemListResponse = () =>
  processListResponses({
    pageDataTransformer: transformPageInfoData,
  });
