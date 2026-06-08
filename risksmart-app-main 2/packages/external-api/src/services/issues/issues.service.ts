import type {
  IClient,
  IssueActionsListResponse,
  IssueCausesListResponse,
  IssueConsequencesListResponse,
  IssueListQueryResponse,
  IssueUpdatesListResponse,
} from '../../clients/client.interface';
import type {
  LinkedListIdDateTimeQueryFetchFn,
  LinkedListQueryFetchFn,
  ListQueryFetchFn,
  ServiceCallContext,
} from '../../types/service';

export type IssuesService = ReturnType<typeof issuesService>;

export function issuesService(client: IClient) {
  const getIssues: ListQueryFetchFn<IssueListQueryResponse['issue']> = async (
    query,
    ctx
  ) => {
    const response = await client.queryIssueList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
      }
    );

    return { data: response.issue, metadata: response.pageMetadata };
  };
  const getIssueById = async (id: string, ctx: ServiceCallContext) => {
    const response = await client.getIssueById(
      { authorization: ctx.authToken },
      id
    );
    if (response === null) {
      return null;
    }
    const { issue, form_configuration } = response;

    return { data: issue, form_configuration };
  };

  const getIssueCauses: LinkedListIdDateTimeQueryFetchFn<
    IssueCausesListResponse['cause']
  > = async (linkId, query, ctx) => {
    const response = await client.queryIssueCausesList(
      { authorization: ctx.authToken },
      { ...query, linkId }
    );

    return { data: response.cause, metadata: response.pageMetadata };
  };

  const getIssueCauseById = async (
    ids: Record<string, string>,
    ctx: ServiceCallContext
  ) => {
    const { causeId = '' } = ids;
    const response = await client.getIssueCauseById(
      { authorization: ctx.authToken },
      causeId
    );
    if (response === null) {
      return null;
    }
    const { cause, form_configuration } = response;

    return { data: cause, form_configuration };
  };

  const getIssueConsequences: LinkedListIdDateTimeQueryFetchFn<
    IssueConsequencesListResponse['consequence']
  > = async (linkId, query, ctx) => {
    const response = await client.queryIssueConsequencesList(
      { authorization: ctx.authToken },
      { ...query, linkId }
    );

    return { data: response.consequence, metadata: response.pageMetadata };
  };

  const getIssueConsequenceById = async (
    ids: Record<string, string>,
    ctx: ServiceCallContext
  ) => {
    const { consequenceId = '' } = ids;
    const response = await client.getIssueConsequenceById(
      { authorization: ctx.authToken },
      consequenceId
    );
    if (response === null) {
      return null;
    }
    const { consequence, form_configuration } = response;

    return { data: consequence, form_configuration };
  };

  const getIssueUpdates: LinkedListIdDateTimeQueryFetchFn<
    IssueUpdatesListResponse['update']
  > = async (linkId, query, ctx) => {
    const response = await client.queryIssueUpdatesList(
      { authorization: ctx.authToken },
      { ...query, linkId }
    );

    return { data: response.update, metadata: response.pageMetadata };
  };

  const getIssueUpdateById = async (
    ids: Record<string, string>,
    ctx: ServiceCallContext
  ) => {
    const { updateId = '' } = ids;
    const response = await client.getIssueUpdateById(
      { authorization: ctx.authToken },
      updateId
    );
    if (response === null) {
      return null;
    }
    const { update, form_configuration } = response;

    return { data: update, form_configuration };
  };

  const getIssueActions: LinkedListQueryFetchFn<
    IssueActionsListResponse['action']
  > = async (linkId, query, ctx) => {
    const response = await client.queryIssueActionsList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
        linkId,
      }
    );

    return { data: response.action, metadata: response.pageMetadata };
  };

  const getIssueAssessment = async (id: string, ctx: ServiceCallContext) => {
    if (!id) {
      return null;
    }
    const response = await client.queryIssueAssessment(
      { authorization: ctx.authToken },
      { id }
    );

    if (response === null) {
      return null;
    }
    const { issueAssessment, form_configuration } = response;

    return { data: issueAssessment, form_configuration };
  };

  return {
    getIssues,
    getIssueById,
    getIssueCauses,
    getIssueCauseById,
    getIssueConsequences,
    getIssueConsequenceById,
    getIssueUpdates,
    getIssueUpdateById,
    getIssueActions,
    getIssueAssessment,
  };
}
