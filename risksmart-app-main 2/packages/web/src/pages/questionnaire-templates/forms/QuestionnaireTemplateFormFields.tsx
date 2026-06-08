import {
  Contributor_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledGroupAndUserContributorMultiSelect from 'src/components/form/controlled-group-and-user-contributor-multi-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import DepartmentSelector from 'src/components/form/department-selector';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import FormRow from 'src/components/form/form/FormRow';
import TagSelector from 'src/components/form/tag-selector';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import type { QuestionnaireTemplateFormData } from './questionnaireTemplateSchema';

interface Props {
  readOnly?: boolean;
}

export const QuestionnaireTemplateFormFields = ({ readOnly }: Props) => {
  const { control } = useFormContext<QuestionnaireTemplateFormData>();
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'questionnaire_templates.fields',
  });
  const formConfig = useFormConfig(Parent_Type_Enum.QuestionnaireTemplate);

  return (
    <CustomisableFieldWrapper>
      <ControlledInput
        key={'title'}
        testId={'title'}
        name={formConfig.Title.fieldId}
        label={formConfig.Title.formLabel}
        description={st('title_help')}
        placeholder={st('title_placeholder')}
        control={control}
        forceRequired
      />

      <ControlledTextarea
        testId={'description'}
        key={'description'}
        name={formConfig.Description.fieldId}
        label={formConfig.Description.formLabel}
        description={st('description_help')}
        placeholder={st('description_placeholder')}
        control={control}
        forceRequired
      />

      <FormRow key={'owners'}>
        <ControlledGroupAndUserContributorMultiSelect
          forceRequired={true}
          testId={'owners'}
          control={control}
          includeGroups={true}
          inheritedContributorsName={'ancestorContributors'}
          label={formConfig.Owners.formLabel}
          name={formConfig.Owners.fieldId}
          description={st('owner_help')}
          placeholder={st('owner_placeholder')}
          disabled={readOnly}
          contributorType={Contributor_Type_Enum.Owner}
        />
      </FormRow>

      <FormRow key={'contributors'}>
        <ControlledGroupAndUserContributorMultiSelect
          key={'contributors'}
          control={control}
          testId={'contributors'}
          includeGroups={true}
          inheritedContributorsName={'ancestorContributors'}
          label={formConfig.Contributors.formLabel}
          name={formConfig.Contributors.fieldId}
          description={st('contributor_help')}
          placeholder={st('contributor_placeholder')}
          disabled={readOnly}
          contributorType={Contributor_Type_Enum.Contributor}
        />
      </FormRow>

      <FormRow size={'xl'} key={'tags'}>
        <TagSelector
          testId={'tags'}
          disabled={readOnly}
          label={formConfig.tags.formLabel}
          name={formConfig.tags.fieldId}
          control={control}
        />
      </FormRow>

      <DepartmentSelector
        key={'departments'}
        testId={'departments'}
        disabled={readOnly}
        label={formConfig.departments.formLabel}
        name={formConfig.departments.fieldId}
        control={control}
      />
    </CustomisableFieldWrapper>
  );
};
