import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormContextProps } from 'src/components/form/form/types';

import type { AssessmentTypeEnum } from '../types';
import ObligationAssessmentResultFormFields from './ObligationAssessmentResultFormFields';
import type { ObligationAssessmentResultFormDataFields } from './obligationAssessmentResultSchema';
import { ObligationAssessmentResultSchema } from './obligationAssessmentResultSchema';

type Props = Omit<
  FormContextProps<ObligationAssessmentResultFormDataFields>,
  'formId' | 'i18n' | 'parentType' | 'schema'
> & {
  beforeFieldsSlot?: ReactNode;
  showSelector?: AssessmentTypeEnum;
  assessmentMode: AssessmentTypeEnum;
  disableObligationSelector: boolean;
};

export type ObligationAssessmentResultFormIds = Extract<
  Parent_Type_Enum,
  | 'obligation_assessment_result'
  | 'obligation_internal_audit_result'
  | 'obligation_second_line_result'
>;

const getParentType = (
  assessmentMode?: AssessmentTypeEnum
): ObligationAssessmentResultFormIds => {
  switch (assessmentMode) {
    case 'internal_audit_report':
      return Parent_Type_Enum.ObligationInternalAuditResult;
    case 'compliance_monitoring_assessment':
      return Parent_Type_Enum.ObligationSecondLineResult;
    case 'rating':
    default:
      return Parent_Type_Enum.ObligationAssessmentResult;
  }
};

const ObligationAssessmentResultForm: FC<Props> = (props) => {
  const { t } = useTranslation('common');
  const parentType = getParentType(props.assessmentMode);

  return (
    <CustomisableForm
      {...props}
      schema={ObligationAssessmentResultSchema}
      i18n={t('assessmentResults')}
      formId={'assessment-result-form'}
      renderTemplate={props.renderTemplate}
      parentType={parentType}
    >
      {' '}
      {props.beforeFieldsSlot}
      <ObligationAssessmentResultFormFields
        readOnly={props.readOnly}
        formId={parentType}
        disableObligationSelector={props.disableObligationSelector}
        showSelector={props.showSelector}
      />
    </CustomisableForm>
  );
};

export default ObligationAssessmentResultForm;
