import type { GetInternalAuditResultsByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { InternalAuditResultFields } from './types';

export const getInternalAuditResultTableFields = (
  data: GetInternalAuditResultsByParentIdQuery | undefined,
  assessmentId: string
): InternalAuditResultFields[] | undefined => {
  return [
    ...(data?.document_internal_audit_result.map((a) => ({
      ...a,
      ParentId: assessmentId,
      typename: a.__typename!,
    })) || []),
    ...(data?.obligation_internal_audit_result.map((a) => ({
      ...a,
      ParentId: assessmentId,
      typename: a.__typename!,
    })) || []),
    ...(data?.risk_controlled_internal_audit_result.map((a) => ({
      ...a,
      ParentId: assessmentId,
      typename: a.__typename!,
      ControlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
    })) || []),
    ...(data?.risk_uncontrolled_internal_audit_result.map((a) => ({
      ...a,
      ParentId: assessmentId,
      typename: a.__typename!,
      ControlType: Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
    })) || []),
    ...(data?.control_test_internal_audit_result.map((a) => ({
      Id: a.Id,
      ParentId: assessmentId,
      Impact: 0,
      Rating: 0,
      OverallEffectiveness: a.OverallEffectiveness,
      ControlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
      TestDate: a.TestDate,
      parents: [],
      parent: a.parent!,
      files: a.files,
      ancestorContributors: [],
      typename: a.__typename!,
    })) || []),
  ];
};
