import { FormBuilder } from '@risksmart-app/components/src/form-builder/FormBuilder';
import { Questionnaire_Template_Version_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledInput from 'src/components/form/controlled-input';

import type { QuestionnaireTemplateVersionFormFieldData } from './questionnaireTemplateVersionSchema';

type QuestionnaireTemplateVersionFormFieldsProps = {
  readOnly?: boolean;
  savedStatus: Questionnaire_Template_Version_Status_Enum;
};

const QuestionnaireTemplateVersionFormFields: FC<
  QuestionnaireTemplateVersionFormFieldsProps
> = ({ readOnly, savedStatus }) => {
  const { control } =
    useFormContext<QuestionnaireTemplateVersionFormFieldData>();
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'questionnaire_template_versions.fields',
  });

  const isArchived =
    savedStatus === Questionnaire_Template_Version_Status_Enum.Archived;
  const isPublished =
    savedStatus === Questionnaire_Template_Version_Status_Enum.Published;
  const versionContentIsDisabled = readOnly || isArchived || isPublished;

  return (
    <>
      <ControlledInput
        key={'version'}
        name={'Version'}
        label={st('version')}
        forceRequired={true}
        description={st('version_help')}
        control={control}
        placeholder={st('version_placeholder')}
        testId={'version'}
        disabled={versionContentIsDisabled}
        stretch={false}
      />

      <FormBuilder key={'form-builder-wrapper'} hasEditPermission={!readOnly} />
    </>
  );
};

export default QuestionnaireTemplateVersionFormFields;
