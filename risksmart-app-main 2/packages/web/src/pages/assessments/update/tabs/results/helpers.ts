import type {
  GetAssessmentResultsByParentIdQuery,
  Parent_Type_Enum,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { getFriendlyId } from '@/utils/friendlyId';

import type { AssessmentResultFields } from './types';

export const getParentTitle = (record: AssessmentResultFields) => {
  switch (record.typename) {
    case 'document_assessment_result':
      return (
        (
          record as Partial<
            Omit<
              GetAssessmentResultsByParentIdQuery['document_assessment_result'][0],
              'files'
            >
          >
        ).parents?.[0]?.document?.Title ??
        getFriendlyId(
          record.parents?.[0]?.node?.ObjectType as Parent_Type_Enum,
          record.parents?.[0]?.node?.SequentialId
        )
      );
    case 'obligation_assessment_result':
      return (
        (
          record as Partial<
            Omit<
              GetAssessmentResultsByParentIdQuery['obligation_assessment_result'][0],
              'files'
            >
          >
        ).parents?.[0]?.obligation?.Title ??
        getFriendlyId(
          record.parents?.[0]?.node?.ObjectType as Parent_Type_Enum,
          record.parents?.[0]?.node?.SequentialId
        )
      );
    case 'risk_assessment_result':
      return (
        (
          record as Partial<
            Omit<
              GetAssessmentResultsByParentIdQuery['risk_assessment_result'][0],
              'files'
            >
          >
        ).parents?.[0]?.risk?.Title ??
        getFriendlyId(
          record.parents?.[0]?.node?.ObjectType as Parent_Type_Enum,
          record.parents?.[0]?.node?.SequentialId
        )
      );
    case 'test_result':
      return (
        (
          record as Partial<
            Omit<GetAssessmentResultsByParentIdQuery['test_result'][0], 'files'>
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
  record: AssessmentResultFields
) => {
  if (record.typename === 'risk_assessment_result') {
    return `${value} - ${getControlTypeLabel(
      (
        record as Partial<
          Omit<
            GetAssessmentResultsByParentIdQuery['risk_assessment_result'][0],
            'files'
          >
        >
      ).ControlType!
    )}`;
  }

  return value;
};
