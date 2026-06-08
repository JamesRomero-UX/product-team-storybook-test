import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import { Contributor_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import { ControlledFileUpload } from 'src/components/form/controlled-file-upload/ControlledFileUpload';
import ControlledGroupAndUserContributorMultiSelect from 'src/components/form/controlled-group-and-user-contributor-multi-select';
import ControlledInput from 'src/components/form/controlled-input';
import { ControlledBooleanRadioGroup } from 'src/components/form/controlled-radio-group/ControlledBooleanRadioGroup';
import { yesNoOptions } from 'src/components/form/controlled-radio-group/radioGroupUtils';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import DepartmentSelector from 'src/components/form/department-selector';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import TagSelector from 'src/components/form/tag-selector';
import type { IssueFormDataFields } from 'src/pages/issues/update/forms/issueSchema';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import { useCommonLookupLazy } from '@/hooks/useCommonLookupLazy';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';

type Props = {
  readOnly?: boolean;
  issueType: ParentIssueType;
};
enum TestIds {
  AttachFiles = 'attachFiles',
  Contributors = 'contributors',
  Departments = 'departments',
  Details = 'details',
  ImpactsCustomer = 'impactsCustomer',
  IsExternalIssue = 'isExternalIssue',
  Owners = 'owners',
  Tags = 'tags',
  Title = 'title',
}

const IssueFormFields: FC<Props> = ({ readOnly, issueType }) => {
  const { control } = useFormContext<IssueFormDataFields>();
  const issueMapping = IssueTypeMapping[issueType];
  const { t: st } = useTranslation(['common'], {
    keyPrefix: issueMapping.taxonomy,
  });

  const { getOptions } = useCommonLookupLazy();
  const issueFormConfig = useFormConfig(issueType);

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledInput
        key={'title'}
        testId={TestIds.Title}
        forceRequired={true}
        name={issueFormConfig.Title.fieldId}
        label={issueFormConfig.Title.formLabel}
        control={control}
        placeholder={st('fields.Title_placeholder') ?? ''}
        disabled={readOnly}
        description={st('fields.Title_help') ?? ''}
      />

      <ControlledTextarea
        key={'details'}
        testId={TestIds.Details}
        defaultRequired={true}
        name={issueFormConfig.Details.fieldId}
        label={issueFormConfig.Details.formLabel}
        placeholder={st('fields.Details_placeholder') ?? ''}
        control={control}
        disabled={readOnly}
        description={st('fields.Details_help')}
      />

      <ControlledBooleanRadioGroup
        key={'impactsCustomer'}
        testId={TestIds.ImpactsCustomer}
        label={issueFormConfig.ImpactsCustomer.formLabel}
        name={issueFormConfig.ImpactsCustomer.fieldId}
        allowDefaultValue={true}
        control={control}
        items={yesNoOptions}
        disabled={readOnly}
        description={st('fields.ImpactsCustomer_help')}
      />

      <ControlledBooleanRadioGroup
        key={'isExternalIssue'}
        testId={TestIds.IsExternalIssue}
        label={issueFormConfig.IsExternalIssue.formLabel}
        name={issueFormConfig.IsExternalIssue.fieldId}
        description={st('fields.IsExternalIssue_help')}
        control={control}
        allowDefaultValue={true}
        items={getOptions(`${issueMapping.taxonomy}.isExternalIssue`)}
        disabled={readOnly}
      />

      <ControlledDatePicker
        key={'dateOccurred'}
        testId={'dateOccurred'}
        forceRequired={true}
        name={issueFormConfig.DateOccurred.fieldId}
        label={issueFormConfig.DateOccurred.formLabel}
        description={st('fields.DateOccurred_help')}
        control={control}
        disabled={readOnly}
      />

      <ControlledDatePicker
        key={'dateIdentified'}
        testId={'dateIdentified'}
        forceRequired={true}
        name={issueFormConfig.DateIdentified.fieldId}
        label={issueFormConfig.DateIdentified.formLabel}
        description={st('fields.DateIdentified_help')}
        control={control}
        disabled={readOnly}
      />

      <ControlledGroupAndUserContributorMultiSelect
        key={'owners'}
        control={control}
        label={issueFormConfig.Owners.formLabel}
        includeGroups={true}
        name={issueFormConfig.Owners.fieldId}
        testId={TestIds.Owners}
        inheritedContributorsName={'ancestorContributors'}
        contributorType={Contributor_Type_Enum.Owner}
        placeholder={st('fields.Owner_placeholder')}
        description={st('fields.Owner_help')}
        disabled={readOnly}
      />

      <ControlledGroupAndUserContributorMultiSelect
        key={'contributors'}
        control={control}
        includeGroups={true}
        inheritedContributorsName={'ancestorContributors'}
        contributorType={Contributor_Type_Enum.Contributor}
        label={issueFormConfig.Contributors.formLabel}
        name={issueFormConfig.Contributors.fieldId}
        testId={TestIds.Contributors}
        placeholder={st('fields.Contributor_placeholder')}
        description={st('fields.Contributor_help')}
        disabled={readOnly}
      />

      <ControlledFileUpload
        key={'newFiles'}
        testId={TestIds.AttachFiles}
        label={issueFormConfig.files.formLabel}
        description={st('fields.newFiles_help')}
        control={control}
        name={issueFormConfig.files.fieldId}
        disabled={readOnly}
      />

      <TagSelector
        testId={TestIds.Tags}
        name={issueFormConfig.tags.fieldId}
        key={'tags'}
        control={control}
        label={issueFormConfig.tags.formLabel}
        description={st('fields.Tags_help')}
        disabled={readOnly}
      />
      <DepartmentSelector
        testId={TestIds.Departments}
        key={'departments'}
        name={issueFormConfig.departments.fieldId}
        label={issueFormConfig.departments.formLabel}
        description={st('fields.Departments_help')}
        control={control}
        disabled={readOnly}
      />
    </CustomisableFieldWrapper>
  );
};

export default IssueFormFields;
