import {
  Parent_Type_Enum,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormContextProps } from 'src/components/form/form/types';

import type { AssessmentTypeEnum } from '../types';
import { getParentTypeFromControlType } from './getParentTypeFromControlType';
import RiskAssessmentResultFormFields from './RiskAssessmentResultFormFields';
import type { RiskAssessmentResultFormDataFields } from './riskAssessmentResultSchema';
import { RiskAssessmentResultSchema } from './riskAssessmentResultSchema';

type Props = Omit<
  FormContextProps<RiskAssessmentResultFormDataFields>,
  'formId' | 'i18n' | 'parentType' | 'schema'
> & {
  beforeFieldsSlot?: ReactNode;
  showSelector?: AssessmentTypeEnum;
  assessmentMode: AssessmentTypeEnum;
  disableRiskSelector: boolean;
};

const RiskAssessmentResultForm: FC<Props> = (props) => {
  const { t } = useTranslation();
  const [controlType, setControlType] =
    useState<Risk_Assessment_Result_Control_Type_Enum>(
      Risk_Assessment_Result_Control_Type_Enum.Uncontrolled
    );

  return (
    <CustomisableForm
      {...props}
      schema={RiskAssessmentResultSchema}
      i18n={t('assessmentResults')}
      formId={'assessment-result-form'}
      renderTemplate={props.renderTemplate}
      possibleParentTypes={[
        Parent_Type_Enum.ControlledRiskAssessmentResult,
        Parent_Type_Enum.UncontrolledRiskAssessmentResult,
        Parent_Type_Enum.RiskUncontrolledSecondLineResult,
        Parent_Type_Enum.RiskControlledSecondLineResult,
        Parent_Type_Enum.RiskControlledInternalAuditResult,
        Parent_Type_Enum.RiskUncontrolledInternalAuditResult,
      ]}
      parentType={getParentTypeFromControlType(
        controlType,
        props.assessmentMode
      )}
    >
      {props.beforeFieldsSlot}
      <RiskAssessmentResultFormFields
        readOnly={props.readOnly}
        onControlTypeChange={setControlType}
        disableRiskSelector={props.disableRiskSelector}
        showSelector={props.showSelector}
        assessmentMode={props.assessmentMode}
      />
    </CustomisableForm>
  );
};

export default RiskAssessmentResultForm;
