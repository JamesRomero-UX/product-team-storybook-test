import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';

export const useControlTypeLabel = () => {
  const { t: ar } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });

  return (controlType: Risk_Assessment_Result_Control_Type_Enum) => {
    switch (controlType) {
      case Risk_Assessment_Result_Control_Type_Enum.Controlled:
        return ar('controlTypes.controlled');
      case Risk_Assessment_Result_Control_Type_Enum.Uncontrolled:
        return ar('controlTypes.uncontrolled');
    }
  };
};
