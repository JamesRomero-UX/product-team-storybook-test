import type {
  IssueByIdResponse,
  IssueListQueryResponse,
} from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  IssueItemResponse,
  IssueListResponse,
} from '../../schemas/schema.types';
import type {
  DataEntityTransformFn,
  ListDataTransformFn,
} from '../../types/transform';
import { pathResourceReference } from '../../utils/transforms';
import {
  type BaseEntityInput,
  transformBaseEntity,
  transformParents,
} from '../common/base.transformer';

type InputData =
  | NonNullable<IssueByIdResponse>['issue']
  | IssueListQueryResponse['issue'][0];

const mapExtendedLinks = (issue: InputData, basePath: string) => {
  const issueBasePath = `${basePath}/issues/${issue.Id}`;

  return {
    actions: pathResourceReference('actions', issueBasePath),
    assessment: pathResourceReference('assessment', issueBasePath),
    causes: pathResourceReference('causes', issueBasePath),
    consequences: pathResourceReference('consequences', issueBasePath),
    updates: pathResourceReference('updates', issueBasePath),
  };
};

// Map issue-specific field names to base entity structure
const mapIssueToBaseEntity = (data: InputData): BaseEntityInput => ({
  Id: data.Id,
  SequentialId: data.SequentialId,
  Title: data.Title,
  Description: data.Details,
  CreatedAtTimestamp: data.CreatedAtTimestamp,
  ModifiedAtTimestamp: data.ModifiedAtTimestamp,
  CreatedByUser: data.CreatedByUser,
  ModifiedByUser: data.ModifiedByUser,
  owners: data.owners,
  contributors: data.contributors,
  tags: data.tags,
});

export type TransformIssuesListFn = ListDataTransformFn<
  IssueListQueryResponse['issue'],
  IssueListResponse[]
>;

export type TransformIssueItemFn = DataEntityTransformFn<
  NonNullable<IssueByIdResponse>['issue'],
  IssueItemResponse
>;

export const transformItem: TransformIssueItemFn = (issue, opts) => {
  const { basePath } = opts;
  const baseEntity = mapIssueToBaseEntity(issue);
  const { baseData, links } = transformBaseEntity(
    baseEntity,
    basePath,
    'issues'
  );

  const responseData: IssueItemResponse = {
    ...baseData,
    dateOccurred: issue.DateOccurred,
    dateIdentified: issue.DateIdentified,
    type: issue.Type,
    isExternalIssue: issue.IsExternalIssue,
    dateRaised: issue.RaisedAtTimestamp,
    impactsCustomer: issue.ImpactsCustomer,
    links: {
      ...links,
      ...mapExtendedLinks(issue, basePath),
    },
  };

  return resourceSchemas.IssueItemResponseSchema.parse(responseData);
};

export const transformListQueryResponse: TransformIssuesListFn = (
  result,
  opts
) => {
  const { basePath } = opts;

  return result.data.map((issue) => {
    const baseEntity = mapIssueToBaseEntity(issue);
    const { baseData, links } = transformBaseEntity(
      baseEntity,
      basePath,
      'issues'
    );
    const parents = transformParents(issue.parents, basePath);

    return resourceSchemas.IssueListResponseSchema.parse({
      ...baseData,
      links: {
        ...links,
        ...mapExtendedLinks(issue, basePath),
        parents,
      },
    });
  });
};
