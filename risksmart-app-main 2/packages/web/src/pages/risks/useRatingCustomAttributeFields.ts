import { useQuery } from '@apollo/client';
import {
  GetFormCustomisationDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { JSONObject } from '@/types/types';

import type { FieldConfig } from '../../utils/table/types';
import { convertRatingSchemasToFieldConfigs } from '../../utils/table/utils/ratingCustomAttributes';

export const useRatingCustomAttributeFields = (): Record<
  string,
  FieldConfig<{ CustomAttributeData: JSONObject }>
> => {
  const { t: ar } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });

  const { data: formData } = useQuery(GetFormCustomisationDocument, {
    variables: {
      parentTypes: [
        Parent_Type_Enum.UncontrolledRiskAssessmentResult,
        Parent_Type_Enum.ControlledRiskAssessmentResult,
      ],
    },
  });

  return useMemo(() => {
    const uncontrolledSchema = formData?.form_configuration?.find(
      (fc) =>
        fc.ParentType === Parent_Type_Enum.UncontrolledRiskAssessmentResult
    )?.customAttributeSchema;

    const controlledSchema = formData?.form_configuration?.find(
      (fc) => fc.ParentType === Parent_Type_Enum.ControlledRiskAssessmentResult
    )?.customAttributeSchema;

    if (!uncontrolledSchema && !controlledSchema) {
      return {};
    }

    return convertRatingSchemasToFieldConfigs({
      uncontrolledSchema: uncontrolledSchema ?? undefined,
      controlledSchema: controlledSchema ?? undefined,
      uncontrolledLabel: ar('controlTypes.uncontrolled'),
      controlledLabel: ar('controlTypes.controlled'),
      enableRelativeDates: false,
    });
  }, [formData, ar]);
};
