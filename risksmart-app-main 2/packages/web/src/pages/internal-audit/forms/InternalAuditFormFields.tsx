import {
  Contributor_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledAutosuggest from 'src/components/form/controlled-autosuggest';
import ControlledGroupAndUserContributorMultiSelect from 'src/components/form/controlled-group-and-user-contributor-multi-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import DepartmentSelector from 'src/components/form/department-selector';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import FormRow from 'src/components/form/form/FormRow';
import TagSelector from 'src/components/form/tag-selector';
import { useGetBusinessAreas } from 'src/hooks/queries';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import { getFriendlyId } from '@/utils/friendlyId';

import { TestIds } from './InternalAuditFormFieldsTestIds';
import type { InternalAuditFormDataFields } from './internalAuditSchema';

interface Props {
  readOnly?: boolean;
}

const InternalAuditFormFields = ({ readOnly }: Props) => {
  const { control } = useFormContext<InternalAuditFormDataFields>();

  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'internalAudits.fields',
  });

  const { data } = useGetBusinessAreas({ queryArgs: {} });

  const businessAreaOptions =
    data?.business_area?.map((c) => ({
      value: c.Title,
      tags: [getFriendlyId(Parent_Type_Enum.BusinessArea, c.SequentialId)],
    })) ?? [];
  const formConfig = useFormConfig(Parent_Type_Enum.InternalAuditEntity);

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledInput
        key={'title'}
        testId={'title'}
        forceRequired={true}
        name={formConfig.Title.fieldId}
        disabled={readOnly}
        label={formConfig.Title.formLabel}
        description={st('Title_help')}
        placeholder={st('Title_placeholder')}
        control={control}
      />
      <ControlledTextarea
        testId={'description'}
        key={'description'}
        disabled={readOnly}
        name={formConfig.Description.fieldId}
        label={formConfig.Description.formLabel}
        placeholder={st('Description_placeholder')}
        control={control}
        description={st('Description_help')}
      />
      <ControlledAutosuggest
        testId={'businessArea'}
        key={'businessArea'}
        disabled={readOnly}
        forceRequired={true}
        name={formConfig.BusinessArea.fieldId}
        label={formConfig.BusinessArea.formLabel}
        placeholder={st('BusinessArea_placeholder')}
        control={control}
        description={st('BusinessArea_help')}
        options={businessAreaOptions}
      />

      <FormRow key={'owners'}>
        <ControlledGroupAndUserContributorMultiSelect
          forceRequired={true}
          control={control}
          includeGroups={true}
          label={formConfig.Owners.formLabel}
          inheritedContributorsName={'ancestorContributors'}
          contributorType={Contributor_Type_Enum.Owner}
          name={formConfig.Owners.fieldId}
          description={st('Owner_help')}
          testId={TestIds.Owners}
          placeholder={t('fields.Owner_placeholder')}
          disabled={readOnly}
        />
      </FormRow>
      <FormRow key={'contributors'}>
        <ControlledGroupAndUserContributorMultiSelect
          key={'contributors'}
          control={control}
          testId={'contributors'}
          includeGroups={true}
          inheritedContributorsName={'ancestorContributors'}
          contributorType={Contributor_Type_Enum.Contributor}
          label={formConfig.Contributors.formLabel}
          name={formConfig.Contributors.fieldId}
          description={st('Contributor_help')}
          placeholder={t('fields.Contributor_placeholder')}
          disabled={readOnly}
        />
      </FormRow>

      <FormRow size={'xl'} key={'tags'}>
        <TagSelector
          testId={'tags'}
          disabled={readOnly}
          name={formConfig.tags.fieldId}
          label={formConfig.tags.formLabel}
          control={control}
        />
      </FormRow>
      <DepartmentSelector
        key={'departments'}
        testId={'departments'}
        disabled={readOnly}
        name={formConfig.departments.fieldId}
        label={formConfig.departments.formLabel}
        control={control}
      />
    </CustomisableFieldWrapper>
  );
};

export default InternalAuditFormFields;
