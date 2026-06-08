import type {
  GetSecondLineResultsByParentIdQuery,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import { getFriendlyId } from '@/utils/friendlyId';

import type { SecondLineResultFields } from './types';

export const getParentTitle = (record: SecondLineResultFields) => {
  switch (record.typename) {
    case 'document_second_line_result':
      return (
        (
          record as Partial<
            Omit<
              GetSecondLineResultsByParentIdQuery['document_second_line_result'][0],
              'files'
            >
          >
        ).parents?.[0]?.document?.Title ??
        getFriendlyId(
          record.parents?.[0]?.node?.ObjectType as Parent_Type_Enum,
          record.parents?.[0]?.node?.SequentialId
        )
      );
    case 'obligation_second_line_result':
      return (
        (
          record as Partial<
            Omit<
              GetSecondLineResultsByParentIdQuery['obligation_second_line_result'][0],
              'files'
            >
          >
        ).parents?.[0]?.obligation?.Title ??
        getFriendlyId(
          record.parents?.[0]?.node?.ObjectType as Parent_Type_Enum,
          record.parents?.[0]?.node?.SequentialId
        )
      );
    case 'risk_controlled_second_line_result':
      return (
        (
          record as Partial<
            Omit<
              GetSecondLineResultsByParentIdQuery['risk_controlled_second_line_result'][0],
              'files'
            >
          >
        ).parents?.[0]?.risk?.Title ??
        getFriendlyId(
          record.parents?.[0]?.node?.ObjectType as Parent_Type_Enum,
          record.parents?.[0]?.node?.SequentialId
        )
      );
    case 'risk_uncontrolled_second_line_result':
      return (
        (
          record as Partial<
            Omit<
              GetSecondLineResultsByParentIdQuery['risk_uncontrolled_second_line_result'][0],
              'files'
            >
          >
        ).parents?.[0]?.risk?.Title ??
        getFriendlyId(
          record.parents?.[0]?.node?.ObjectType as Parent_Type_Enum,
          record.parents?.[0]?.node?.SequentialId
        )
      );
    case 'control_test_second_line_result':
      return (
        (
          record as Partial<
            Omit<
              GetSecondLineResultsByParentIdQuery['control_test_second_line_result'][0],
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
  record: SecondLineResultFields
) => {
  if (record.typename === 'risk_controlled_second_line_result') {
    return `${value} - ${getControlTypeLabel(Risk_Assessment_Result_Control_Type_Enum.Controlled)}`;
  }

  if (record.typename === 'risk_uncontrolled_second_line_result') {
    return `${value} - ${getControlTypeLabel(Risk_Assessment_Result_Control_Type_Enum.Uncontrolled)}`;
  }

  return value;
};
