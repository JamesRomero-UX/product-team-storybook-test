import type {
  IssueUpdateByIdResponse,
  IssueUpdatesListResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  IssueUpdateItemResponse,
  IssueUpdateListResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import { createNestedEntityTransformers } from '../common/base.transformer';

type IssueUpdateInput =
  | NonNullable<IssueUpdateByIdResponse>['update']
  | IssueUpdatesListResponse['update'][0];

const { transformItem, transformList } = createNestedEntityTransformers<
  IssueUpdateInput,
  IssueUpdateItemResponse,
  IssueUpdateListResponse
>({
  parentResourceName: 'issues',
  childResourceName: 'updates',
  parentIdField: 'ParentIssueId',
  parentResourceType: 'issue',
  itemSchema: resourceSchemas.IssueUpdateItemResponseSchema,
  listSchema: resourceSchemas.IssueUpdateListResponseSchema,
  extractItemFields: () => ({}),
  extractListFields: () => ({}),
});

export type TransformIssueUpdateItemFn = DataEntityTransformFn<
  NonNullable<IssueUpdateByIdResponse>['update'],
  IssueUpdateItemResponse
>;

export type TransformIssueUpdatesListFn = ListDataTransformFn<
  IssueUpdatesListResponse['update'],
  IssueUpdateListResponse[]
>;

export const transformIssueUpdateItem: TransformIssueUpdateItemFn =
  transformItem;

export const transformIssueUpdateListQueryResponse: TransformIssueUpdatesListFn =
  transformList;
