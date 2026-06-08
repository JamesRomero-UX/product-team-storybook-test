import type {
  Parent_Type_Enum,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { getFriendlyId } from '@/utils/friendlyId';

import type { ComplianceMonitoringAssessmentResultFields } from './types';

export const getParentTitle = (
  record: ComplianceMonitoringAssessmentResultFields
) => {
  switch (record.__typename) {
    case 'document_second_line_result': {
      const d = record?.documents;

      return (
        d?.[0]?.document?.Title ??
        getFriendlyId(
          d?.[0]?.node?.ObjectType as Parent_Type_Enum,
          d?.[0]?.node?.SequentialId
        )
      );
    }
    case 'obligation_second_line_result': {
      const o = record?.obligations;

      return (
        o?.[0]?.obligation?.Title ??
        getFriendlyId(
          o?.[0]?.node?.ObjectType as Parent_Type_Enum,
          o?.[0]?.node?.SequentialId
        )
      );
    }
    case 'risk_uncontrolled_second_line_result':
    case 'risk_controlled_second_line_result': {
      const r = record?.risks;

      return (
        r?.[0]?.risk?.Title ??
        getFriendlyId(
          r?.[0]?.node?.ObjectType as Parent_Type_Enum,
          r?.[0]?.node?.SequentialId
        )
      );
    }
  }
};

export const decorateWithControlType = (
  value: string,
  getControlTypeLabel: (
    controlType: Risk_Assessment_Result_Control_Type_Enum
  ) => string,
  record: ComplianceMonitoringAssessmentResultFields
) => {
  if (
    record.__typename === 'risk_controlled_second_line_result' ||
    record.__typename === 'risk_uncontrolled_second_line_result'
  ) {
    return `${value} - ${getControlTypeLabel(record.ControlType!)}`;
  }

  return value;
};
