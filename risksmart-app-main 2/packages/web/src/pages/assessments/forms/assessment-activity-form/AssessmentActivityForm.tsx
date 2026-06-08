import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormContextProps } from 'src/components/form/form/types';

import AssessmentActivityFormFields from './AssessmentActivityFormFields';
import type { AssessmentActivityFormDataFields } from './assessmentActivitySchema';
import {
  BaseAssessmentActivitySchema,
  defaultValues,
} from './assessmentActivitySchema';

type Props = Omit<
  FormContextProps<AssessmentActivityFormDataFields>,
  'defaultValues' | 'formId' | 'i18n' | 'parentType' | 'schema'
>;

const AssessmentActivityForm: FC<Props> = (props) => {
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
      <AssessmentActivityFormFields readOnly={props.readOnly} />
    </CustomisableForm>
  );
};

export default AssessmentActivityForm;
