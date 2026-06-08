import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import {
  Contributor_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ControlledFileUpload } from 'src/components/form/controlled-file-upload/ControlledFileUpload';
import ControlledGroupAndUserContributorMultiSelect from 'src/components/form/controlled-group-and-user-contributor-multi-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledRadioGroup from 'src/components/form/controlled-radio-group';
import { noTransform } from 'src/components/form/controlled-radio-group/radioGroupUtils';
import ControlledSelect from 'src/components/form/controlled-select';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import DepartmentSelector from 'src/components/form/department-selector';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import TagSelector from 'src/components/form/tag-selector';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import type { ThirdPartyFormData } from './thirdPartySchema';

type Props = {
  readOnly?: boolean;
};

export const ThirdPartyFormFields: FC<Props> = ({ readOnly }) => {
  const { control } = useFormContext<ThirdPartyFormData>();
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'third_party.fields',
  });

  const { options: typeRatingOptions } = useRating('third_party_type');
  const typeOptions = typeRatingOptions.map((option) => ({
    ...option,
    value: String(option.value),
  }));

  const { options: statusRatingOptions } = useRating('third_party_status');
  const statusOptions = statusRatingOptions.map((option) => ({
    ...option,
    value: String(option.value),
  }));

  const { options: criticalityRatingOptions } = useRating(
    'third_party_criticality'
  );
  const criticalityOptions = criticalityRatingOptions.map((option) => ({
    ...option,
    value: String(option.value),
  }));
  const formConfig = useFormConfig(Parent_Type_Enum.ThirdParty);

  return (
    <CustomisableFieldWrapper>
      <ControlledInput
        key={'title'}
        testId={'title'}
        name={formConfig.title.fieldId}
        label={formConfig.title.formLabel}
        description={st('title_help')}
        placeholder={st('title_placeholder')}
        control={control}
        readOnly={readOnly}
        forceRequired
      />
      <ControlledTextarea
        testId={'description'}
        key={'description'}
        name={formConfig.description.fieldId}
        label={formConfig.description.formLabel}
        description={st('description_help')}
        placeholder={st('description_placeholder')}
        control={control}
        readOnly={readOnly}
      />
      <ControlledInput
        testId={'companyName'}
        key={'companyName'}
        name={formConfig.companyName.fieldId}
        label={formConfig.companyName.formLabel}
        description={st('companyName_help')}
        placeholder={st('companyName_placeholder')}
        control={control}
        readOnly={readOnly}
      />
      <ControlledInput
        testId={'companiesHouseNumber'}
        key={'companiesHouseNumber'}
        name={formConfig.companiesHouseNumber.fieldId}
        label={formConfig.companiesHouseNumber.formLabel}
        description={st('companiesHouseNumber_help')}
        placeholder={st('companiesHouseNumber_placeholder')}
        control={control}
        readOnly={readOnly}
      />
      <ControlledInput
        testId={'address'}
        key={'address'}
        name={formConfig.address.fieldId}
        label={formConfig.address.formLabel}
        description={st('address_help')}
        placeholder={st('address_placeholder')}
        control={control}
        readOnly={readOnly}
      />
      <ControlledInput
        testId={'cityTown'}
        key={'cityTown'}
        name={formConfig.cityTown.fieldId}
        label={formConfig.cityTown.formLabel}
        description={st('cityTown_help')}
        placeholder={st('cityTown_placeholder')}
        control={control}
        readOnly={readOnly}
      />
      <ControlledInput
        testId={'postcode'}
        key={'postcode'}
        name={formConfig.postcode.fieldId}
        label={formConfig.postcode.formLabel}
        description={st('postcode_help')}
        placeholder={st('postcode_placeholder')}
        control={control}
        readOnly={readOnly}
      />
      <ControlledInput
        testId={'country'}
        key={'country'}
        name={formConfig.country.fieldId}
        label={formConfig.country.formLabel}
        description={st('country_help')}
        placeholder={st('country_placeholder')}
        control={control}
        readOnly={readOnly}
      />
      <ControlledInput
        testId={'primaryContactName'}
        key={'primaryContactName'}
        name={formConfig.primaryContactName.fieldId}
        label={formConfig.primaryContactName.formLabel}
        description={st('primaryContactName_help')}
        placeholder={st('primaryContactName_placeholder')}
        control={control}
        readOnly={readOnly}
      />
      <ControlledInput
        testId={'contactName'}
        key={'contactName'}
        name={formConfig.contactName.fieldId}
        label={formConfig.contactName.formLabel}
        description={st('contactName_help')}
        placeholder={st('contactName_placeholder')}
        control={control}
        readOnly={readOnly}
      />
      <ControlledInput
        testId={'contactEmail'}
        key={'contactEmail'}
        name={formConfig.contactEmail.fieldId}
        label={formConfig.contactEmail.formLabel}
        description={st('contactEmail_help')}
        placeholder={st('contactEmail_placeholder')}
        control={control}
        readOnly={readOnly}
      />
      <ControlledInput
        testId={'companyDomain'}
        key={'companyDomain'}
        name={formConfig.companyDomain.fieldId}
        label={formConfig.companyDomain.formLabel}
        description={st('companyDomain_help')}
        placeholder={st('companyDomain_placeholder')}
        control={control}
        readOnly={readOnly}
      />
      <ControlledRadioGroup
        testId={'type'}
        key={'type'}
        name={formConfig.type.fieldId}
        label={formConfig.type.formLabel}
        description={st('type_help')}
        placeholder={st('type_placeholder')}
        items={typeOptions}
        transform={noTransform}
        control={control}
        readOnly={readOnly}
        forceRequired
      />
      <ControlledSelect
        testId={'status'}
        key={'status'}
        name={formConfig.status.fieldId}
        label={formConfig.status.formLabel}
        description={st('status_help')}
        placeholder={st('status_placeholder')}
        control={control}
        options={statusOptions}
        readOnly={readOnly}
        forceRequired
      />
      <ControlledSelect
        addEmptyOption={true}
        key={'criticality'}
        name={formConfig.criticality.fieldId}
        testId={'criticality'}
        label={formConfig.criticality.formLabel}
        description={st('criticality_help')}
        placeholder={st('criticality_placeholder')}
        control={control}
        options={criticalityOptions}
        readOnly={readOnly}
      />

      <ControlledGroupAndUserContributorMultiSelect
        key={'owners'}
        forceRequired={true}
        testId={'owners'}
        control={control}
        includeGroups={true}
        inheritedContributorsName={'ancestorContributors'}
        label={formConfig.Owners.formLabel}
        name={formConfig.Owners.fieldId}
        description={st('owners_help')}
        placeholder={st('owners_placeholder')}
        contributorType={Contributor_Type_Enum.Owner}
        readOnly={readOnly}
      />

      <ControlledGroupAndUserContributorMultiSelect
        testId={'contributors'}
        key={'contributors'}
        control={control}
        includeGroups={true}
        inheritedContributorsName={'ancestorContributors'}
        label={formConfig.Contributors.formLabel}
        name={formConfig.Contributors.fieldId}
        description={st('contributors_help')}
        placeholder={st('contributors_placeholder')}
        contributorType={Contributor_Type_Enum.Contributor}
        readOnly={readOnly}
      />

      <TagSelector
        key={'tags'}
        label={formConfig.tags.formLabel}
        name={formConfig.tags.fieldId}
        testId={'tags'}
        control={control}
        readOnly={readOnly}
      />

      <DepartmentSelector
        key={'departments'}
        testId={'departments'}
        label={formConfig.departments.formLabel}
        name={formConfig.departments.fieldId}
        control={control}
        readOnly={readOnly}
      />

      <ControlledFileUpload
        testId={'attachFiles'}
        key={'newFiles'}
        label={formConfig.files.formLabel}
        description={st('newFiles_help')}
        control={control}
        name={formConfig.files.fieldId}
        disabled={readOnly}
      />
    </CustomisableFieldWrapper>
  );
};
