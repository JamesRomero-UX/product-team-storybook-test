import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import type { FormContextProps } from 'src/components/form/form/types';

import type { AssessmentTypeEnum } from '../types';
import DocumentAssessmentResultFormFields from './DocumentAssessmentResultFormFields';
import type { DocumentAssessmentResultFormDataFields } from './documentAssessmentResultSchema';
import { DocumentAssessmentResultSchema } from './documentAssessmentResultSchema';
import { getDocumentAssessmentResultParentType } from './getDocumentAssessmentResultParentType';

type Props = Omit<
  FormContextProps<DocumentAssessmentResultFormDataFields>,
  'formId' | 'i18n' | 'parentType' | 'schema'
> & {
  beforeFieldsSlot?: ReactNode;
  showSelector?: AssessmentTypeEnum;
  assessmentMode: AssessmentTypeEnum;
  disableDocumentSelector: boolean;
};

const DocumentAssessmentResultForm: FC<Props> = (props) => {
  const { t } = useTranslation('common');

  return (
    <CustomisableForm
      {...props}
      schema={DocumentAssessmentResultSchema}
      i18n={t('assessmentResults')}
      formId={'assessment-result-form'}
      renderTemplate={props.renderTemplate}
      parentType={getDocumentAssessmentResultParentType(props.assessmentMode)}
    >
      {props.beforeFieldsSlot}
      <DocumentAssessmentResultFormFields
        readOnly={props.readOnly}
        disableDocumentSelector={props.disableDocumentSelector}
        showSelector={props.showSelector}
        assessmentMode={props.assessmentMode}
      />
    </CustomisableForm>
  );
};

export default DocumentAssessmentResultForm;
