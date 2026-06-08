import type { UpdateIssueRequest } from '../../schemas/issues/issue-mutate-request.schema';

export interface IssueUpdateDefaults {
  Details: string | null;
  ImpactsCustomer: boolean | null;
  IsExternalIssue: boolean | null;
}

export function mergeIssueUpdateDefaults(
  item: UpdateIssueRequest,
  existing: IssueUpdateDefaults
): UpdateIssueRequest {
  return {
    ...item,
    ...(item.description === undefined && existing.Details !== undefined
      ? { description: existing.Details }
      : {}),
    ...(item.impactsCustomer === undefined &&
    existing.ImpactsCustomer !== undefined
      ? { impactsCustomer: existing.ImpactsCustomer }
      : {}),
    ...(item.isExternalIssue === undefined &&
    existing.IsExternalIssue !== undefined
      ? { isExternalIssue: existing.IsExternalIssue }
      : {}),
  };
}
