import type {
  IssueConsequenceByIdResponse,
  IssueConsequencesListResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  ConsequenceItemResponse,
  ConsequenceListResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import { createNestedEntityTransformers } from '../common/base.transformer';

type ConsequenceInput =
  NonNullable<IssueConsequenceByIdResponse>['consequence'];

const { transformItem, transformList } = createNestedEntityTransformers<
  ConsequenceInput,
  ConsequenceItemResponse,
  ConsequenceListResponse
>({
  parentResourceName: 'issues',
  childResourceName: 'consequences',
  parentIdField: 'ParentIssueId',
  parentResourceType: 'issue',
  itemSchema: resourceSchemas.ConsequenceItemResponseSchema,
  listSchema: resourceSchemas.ConsequenceListResponseSchema,
  extractItemFields: (consequence) => ({
    costType: consequence.CostType,
    costValue: consequence.CostValue,
    criticality: consequence.Criticality,
    type: consequence.Type,
  }),
  extractListFields: () => ({}),
});

export type TransformConsequenceItemFn = DataEntityTransformFn<
  NonNullable<IssueConsequenceByIdResponse>['consequence'],
  ConsequenceItemResponse
>;

export type TransformConsequencesListFn = ListDataTransformFn<
  IssueConsequencesListResponse['consequence'],
  ConsequenceListResponse[]
>;

export const transformConsequenceItem: TransformConsequenceItemFn =
  transformItem;

export const transformConsequenceListQueryResponse: TransformConsequencesListFn =
  transformList;
