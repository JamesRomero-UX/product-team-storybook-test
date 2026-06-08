import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import { CustomisableForm } from 'src/components/form/form/CustomisableForm';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import type { FormContextProps } from 'src/components/form/form/types';

import { QuestionnaireTemplateFormFields } from './QuestionnaireTemplateFormFields';
import type { QuestionnaireTemplateFormData } from './questionnaireTemplateSchema';
import {
  defaultValues,
  questionnaireTemplateFormSchema,
} from './questionnaireTemplateSchema';

export type Props = Omit<
  FormContextProps<QuestionnaireTemplateFormData>,
  | 'defaultValues'
  | 'formId'
  | 'i18n'
  | 'mapPreviewedChanges'
  | 'parentType'
  | 'renderTemplate'
  | 'schema'
>;

export const QuestionnaireTemplateForm = ({ ...props }: Props) => {
  const { t } = useTranslation();

  return (
    <CustomisableForm
      {...props}
      formId={'questionnaire-template-form'}
      defaultValues={defaultValues}
      i18n={t('questionnaire_templates')}
      header={t('details')}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
      parentType={Parent_Type_Enum.QuestionnaireTemplate}
      schema={questionnaireTemplateFormSchema}
    >
      <QuestionnaireTemplateFormFields />
    </CustomisableForm>
  );
};
