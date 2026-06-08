import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormContextProps } from 'src/components/form/form/types';

import type { AssessmentTypeEnum } from '../../../assessments/types';
import { getParentType } from './getParentType';
import TestResultFormFields from './TestResultFormFields';
import type { TestResultFormFieldsData } from './testResultSchema';
import { TestResultFormSchema } from './testResultSchema';

export type Props = Omit<
  FormContextProps<TestResultFormFieldsData>,
  'formId' | 'i18n' | 'parentType' | 'schema'
> & {
  disableControlSelect?: boolean;
  assessmentMode: AssessmentTypeEnum;
  beforeFieldsSlot?: ReactNode;
};

const TestResultForm: FC<Props> = ({ beforeFieldsSlot, ...props }) => {
  const { t } = useTranslation('common');

  return (
    <CustomisableForm
      {...props}
      schema={TestResultFormSchema}
      i18n={t('testResults')}
      formId={'test-result-form'}
      parentType={getParentType(props.assessmentMode)}
    >
      {beforeFieldsSlot}
      <TestResultFormFields
        readOnly={props.readOnly}
        disableControlSelect={props.disableControlSelect}
        assessmentMode={props.assessmentMode}
      />
    </CustomisableForm>
  );
};

export default TestResultForm;
