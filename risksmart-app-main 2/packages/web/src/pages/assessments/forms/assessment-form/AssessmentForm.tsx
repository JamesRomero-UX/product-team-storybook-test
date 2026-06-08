import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormContextProps } from 'src/components/form/form/types';

import AssessmentFormFields from './AssessmentFormFields';
import type { AssessmentFormDataFields } from './assessmentSchema';
import { AssessmentFormSchema, defaultValues } from './assessmentSchema';

type Props = Omit<
  FormContextProps<AssessmentFormDataFields>,
  'defaultValues' | 'formId' | 'i18n' | 'parentType' | 'schema'
> & {
  initialTier?: number;
  riskId?: string;
  disabledUsers?: { userId: string; reason: string }[];
};

const AssessmentForm: FC<Props> = (props) => {
  const { t } = useTranslation(['common']);
  const { user } = useRisksmartUser();
  const { t: ts } = useTranslation(['common'], { keyPrefix: 'assessments' });
  const defaultData: AssessmentFormDataFields = {
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
      schema={AssessmentFormSchema}
      defaultValues={defaultData}
      i18n={{ entity_name: ts('entity_name') }}
      formId={'assessment-form'}
      parentType={Parent_Type_Enum.Assessment}
      renderTemplate={props.renderTemplate}
    >
      <AssessmentFormFields
        readOnly={props.readOnly}
        disabledUsers={props.disabledUsers}
      />
    </CustomisableForm>
  );
};

export default AssessmentForm;
