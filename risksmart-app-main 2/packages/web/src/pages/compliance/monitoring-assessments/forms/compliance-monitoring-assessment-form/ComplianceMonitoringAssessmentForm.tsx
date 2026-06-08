import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormContextProps } from 'src/components/form/form/types';

import ComplianceMonitoringAssessmentFormFields from './ComplianceMonitoringAssessmentFormFields';
import type { ComplianceMonitoringAssessmentFormDataFields } from './complianceMonitoringAssessmentSchema';
import {
  ComplianceMonitoringAssessmentFormSchema,
  defaultValues,
} from './complianceMonitoringAssessmentSchema';

type Props = Omit<
  FormContextProps<ComplianceMonitoringAssessmentFormDataFields>,
  'defaultValues' | 'formId' | 'i18n' | 'parentType' | 'schema'
> & {
  initialTier?: number;
  riskId?: string;
  disabledUsers?: { userId: string; reason: string }[];
};

const ComplianceMonitoringAssessmentForm: FC<Props> = (props) => {
  const { t } = useTranslation(['common']);
  const { user } = useRisksmartUser();
  const { t: ts } = useTranslation(['common'], {
    keyPrefix: 'complianceMonitoringAssessment',
  });
  const defaultData: ComplianceMonitoringAssessmentFormDataFields = {
    ...defaultValues,
    Owners: [
      {
        type: 'user',
        value: user!.userId,
      },
    ],
  };

  return (
    <CustomisableForm
      {...props}
      header={t('details')}
      schema={ComplianceMonitoringAssessmentFormSchema}
      defaultValues={defaultData}
      i18n={{ entity_name: ts('entity_name') }}
      formId={'compliance-monitoring-assessment-form'}
      parentType={Parent_Type_Enum.ComplianceMonitoringAssessment}
      renderTemplate={props.renderTemplate}
    >
      <ComplianceMonitoringAssessmentFormFields
        readOnly={props.readOnly}
        disabledUsers={props.disabledUsers}
      />
    </CustomisableForm>
  );
};

export default ComplianceMonitoringAssessmentForm;
