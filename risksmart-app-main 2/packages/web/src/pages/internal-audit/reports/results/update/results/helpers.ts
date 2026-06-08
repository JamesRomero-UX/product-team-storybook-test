import type {
  GetInternalAuditResultsByParentIdQuery,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import { getFriendlyId } from '@/utils/friendlyId';

import type { InternalAuditResultFields } from './types';

export const getParentTitle = (record: InternalAuditResultFields) => {
  switch (record.typename) {
    case 'document_internal_audit_result':
      return (
        (
          record as Partial<
            Omit<
              GetInternalAuditResultsByParentIdQuery['document_internal_audit_result'][0],
              'files'
            >
          >
        ).parents?.[0]?.document?.Title ??
        getFriendlyId(
          record.parents?.[0]?.node?.ObjectType as Parent_Type_Enum,
          record.parents?.[0]?.node?.SequentialId
        )
      );
    case 'obligation_internal_audit_result':
      return (
        (
          record as Partial<
            Omit<
              GetInternalAuditResultsByParentIdQuery['obligation_internal_audit_result'][0],
              'files'
            >
          >
        ).parents?.[0]?.obligation?.Title ??
        getFriendlyId(
          record.parents?.[0]?.node?.ObjectType as Parent_Type_Enum,
          record.parents?.[0]?.node?.SequentialId
        )
      );
    case 'risk_controlled_internal_audit_result':
      return (
        (
          record as Partial<
            Omit<
              GetInternalAuditResultsByParentIdQuery['risk_controlled_internal_audit_result'][0],
              'files'
            >
          >
        ).parents?.[0]?.risk?.Title ??
        getFriendlyId(
          record.parents?.[0]?.node?.ObjectType as Parent_Type_Enum,
          record.parents?.[0]?.node?.SequentialId
        )
      );
    case 'risk_uncontrolled_internal_audit_result':
      return (
        (
          record as Partial<
            Omit<
              GetInternalAuditResultsByParentIdQuery['risk_uncontrolled_internal_audit_result'][0],
              'files'
            >
          >
        ).parents?.[0]?.risk?.Title ??
        getFriendlyId(
          record.parents?.[0]?.node?.ObjectType as Parent_Type_Enum,
          record.parents?.[0]?.node?.SequentialId
        )
      );
    case 'control_test_internal_audit_result':
      return (
        (
          record as Partial<
            Omit<
              GetInternalAuditResultsByParentIdQuery['control_test_internal_audit_result'][0],
              'files'
            >
          >
        )?.parent?.Title ?? '-'
      );
  }
};

export const decorateWithControlType = (
  value: string,
  getControlTypeLabel: (
    controlType: Risk_Assessment_Result_Control_Type_Enum
  ) => string,
  record: InternalAuditResultFields
) => {
  if (record.typename === 'risk_controlled_internal_audit_result') {
    return `${value} - ${getControlTypeLabel(Risk_Assessment_Result_Control_Type_Enum.Controlled)}`;
  }

  if (record.typename === 'risk_uncontrolled_internal_audit_result') {
    return `${value} - ${getControlTypeLabel(Risk_Assessment_Result_Control_Type_Enum.Uncontrolled)}`;
  }

  return value;
};
