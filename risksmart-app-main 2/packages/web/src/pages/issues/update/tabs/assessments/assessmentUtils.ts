import type { GetIssueAssessmentByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

type Parent = {
  IssueId: string;
  ParentId: string;
  ParentType: Parent_Type_Enum;
};

export const getAssociatedControlIds = (
  data: GetIssueAssessmentByParentIdQuery | undefined
) =>
  data?.issue_parent
    .filter((i) => i.parent?.ObjectType === Parent_Type_Enum.Control)
    .map((i) => i.ParentId) ?? [];

export const mapParentsToIds = (
  parents: Parent[],
  objectType: Parent_Type_Enum
) => {
  const ids =
    parents
      .filter((parent) => parent.ParentType === objectType)
      .map(({ ParentId }: { ParentId: string }) => ({
        value: ParentId,
      })) ?? [];

  return ids;
};
