import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormContextProps } from 'src/components/form/form/types';

import AssessmentRCSAActivityFormFields from './AssessmentRCSAActivityFormFields';
import type { AssessmentRCSAActivityFormDataFields } from './assessmentRCSAActivitySchema';
import {
  BaseAssessmentActivitySchema,
  defaultValues,
} from './assessmentRCSAActivitySchema';

type Props = Omit<
  FormContextProps<AssessmentRCSAActivityFormDataFields>,
  'defaultValues' | 'formId' | 'i18n' | 'parentType' | 'schema'
> & { disableRiskSelect?: boolean; isUpdate?: boolean };

const AssessmentRCSAActivityForm: FC<Props> = (props) => {
  const { t } = useTranslation(['common']);

  return (
    <CustomisableForm
      {...props}
      header={t('details')}
      schema={BaseAssessmentActivitySchema}
      defaultValues={defaultValues}
      i18n={t('assessmentActivities')}
      formId={'assessment-activity-form'}
      parentType={Parent_Type_Enum.AssessmentActivity}
      renderTemplate={props.renderTemplate}
    >
      <AssessmentRCSAActivityFormFields
        readOnly={props.readOnly}
        disableRiskSelect={props.disableRiskSelect}
        isUpdate={props.isUpdate}
      />
    </CustomisableForm>
  );
};

export default AssessmentRCSAActivityForm;
