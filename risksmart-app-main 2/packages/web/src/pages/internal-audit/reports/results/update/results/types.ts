import type {
  GetInternalAuditResultsByParentIdQuery,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type InternalAuditResultFields = CollectionData<
  | GetInternalAuditResultsByParentIdQuery['document_internal_audit_result'][0]
  | GetInternalAuditResultsByParentIdQuery['obligation_internal_audit_result'][0]
  | GetInternalAuditResultsByParentIdQuery['risk_controlled_internal_audit_result'][0]
  | GetInternalAuditResultsByParentIdQuery['risk_uncontrolled_internal_audit_result'][0]
> & {
  typename: string;
  Id: string;
  ParentId: string;
  ControlType?: Risk_Assessment_Result_Control_Type_Enum;
  parent?: GetInternalAuditResultsByParentIdQuery['control_test_internal_audit_result'][0]['parent'];
  OverallEffectiveness?: GetInternalAuditResultsByParentIdQuery['control_test_internal_audit_result'][0]['OverallEffectiveness'];
  DesignEffectiveness?: GetInternalAuditResultsByParentIdQuery['control_test_internal_audit_result'][0]['DesignEffectiveness'];
  PerformanceEffectiveness?: GetInternalAuditResultsByParentIdQuery['control_test_internal_audit_result'][0]['PerformanceEffectiveness'];
};

export type InternalAuditResultRegisterFields = InternalAuditResultFields & {
  TypeLabelled: string;
  ParentTitle: string;
  RatingLabelled: string | undefined;
};
