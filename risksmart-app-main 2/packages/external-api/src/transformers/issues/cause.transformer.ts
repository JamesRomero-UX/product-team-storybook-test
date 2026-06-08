import type {
  IssueCauseByIdResponse,
  IssueCausesListResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  CauseItemResponse,
  CauseListResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import { createNestedEntityTransformers } from '../common/base.transformer';

type CauseInput = NonNullable<IssueCauseByIdResponse>['cause'];

const { transformItem, transformList } = createNestedEntityTransformers<
  CauseInput,
  CauseItemResponse,
  CauseListResponse
>({
  parentResourceName: 'issues',
  childResourceName: 'causes',
  parentIdField: 'ParentIssueId',
  parentResourceType: 'issue',
  itemSchema: resourceSchemas.CauseItemResponseSchema,
  listSchema: resourceSchemas.CauseListResponseSchema,
  extractItemFields: (cause) => ({
    significance: cause.Significance,
  }),
  extractListFields: (cause) => ({
    significance: cause.Significance,
  }),
});

export type TransformCauseItemFn = DataEntityTransformFn<
  NonNullable<IssueCauseByIdResponse>['cause'],
  CauseItemResponse
>;

export type TransformCausesListFn = ListDataTransformFn<
  IssueCausesListResponse['cause'],
  CauseListResponse[]
>;

export const transformCauseItem: TransformCauseItemFn = transformItem;

export const transformCauseListQueryResponse: TransformCausesListFn =
  transformList;
