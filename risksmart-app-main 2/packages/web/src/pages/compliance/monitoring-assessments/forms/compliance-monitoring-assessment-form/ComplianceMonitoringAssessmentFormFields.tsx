import {
  Contributor_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import ControlledGroupAndUserContributorMultiSelect from 'src/components/form/controlled-group-and-user-contributor-multi-select';
import ControlledGroupAndUserSelect from 'src/components/form/controlled-group-and-user-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledRadioGroup from 'src/components/form/controlled-radio-group';
import { noTransform } from 'src/components/form/controlled-radio-group/radioGroupUtils';
import ControlledRating from 'src/components/form/controlled-rating';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import DepartmentSelector from 'src/components/form/department-selector';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import FormRow from 'src/components/form/form/FormRow';
import TagSelector from 'src/components/form/tag-selector';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import type { ComplianceMonitoringAssessmentFormDataFields } from './complianceMonitoringAssessmentSchema';

interface Props {
  readOnly?: boolean;
  disabledUsers?: { userId: string; reason: string }[];
}

enum TestIds {
  ActualCompletionDate = 'actualCompletionDate',
  CompletedByUser = 'completedByUser',
  NextTestDate = 'nextTestDate',
  Owners = 'owners',
  StartDate = 'startDate',
  Status = 'status',
  Summary = 'summary',
  TargetCompletionDate = 'targetCompletionDate',
  Title = 'title',
}

const ComplianceMonitoringAssessmentFormFields = ({
  readOnly,
  disabledUsers,
}: Props) => {
  const { control } =
    useFormContext<ComplianceMonitoringAssessmentFormDataFields>();
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: `complianceMonitoringAssessment.fields`,
  });
  const { t: ast } = useTranslation(['common'], {
    keyPrefix: `complianceMonitoringAssessment`,
  });
  const statusTypes = ast('status', { returnObjects: true });
  const statusTypesOptions = Object.keys(statusTypes).map((key) => ({
    value: key,
    label: statusTypes[key as keyof typeof statusTypes],
  }));
  const assessmentFormConfig = useFormConfig(
    Parent_Type_Enum.ComplianceMonitoringAssessment
  );

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledInput
        key={'title'}
        testId={TestIds.Title}
        forceRequired={true}
        disabled={readOnly}
        name={assessmentFormConfig.Title.fieldId}
        label={assessmentFormConfig.Title.formLabel}
        placeholder={st('Title_placeholder')}
        description={st('Title_help')}
        control={control}
      />

      <ControlledTextarea
        key={'summary'}
        testId={TestIds.Summary}
        disabled={readOnly}
        defaultRequired={true}
        name={assessmentFormConfig.Summary.fieldId}
        label={assessmentFormConfig.Summary.formLabel}
        placeholder={st('Summary_placeholder')}
        description={st('Summary_help')}
        control={control}
      />

      <ControlledGroupAndUserSelect
        key={'completion-by'}
        testId={TestIds.CompletedByUser}
        disabled={readOnly}
        defaultRequired={false}
        name={assessmentFormConfig.CompletedByUser.fieldId}
        label={assessmentFormConfig.CompletedByUser.formLabel}
        placeholder={st('CompletedBy_placeholder')}
        description={st('CompletedBy_help')}
        control={control}
        includeGroups={false}
      />

      <ControlledDatePicker
        key={'start-date'}
        testId={TestIds.StartDate}
        disabled={readOnly}
        name={assessmentFormConfig.StartDate.fieldId}
        label={assessmentFormConfig.StartDate.formLabel}
        description={st('StartDate_help')}
        control={control}
      />

      <ControlledDatePicker
        key={'target-completion-date'}
        testId={TestIds.TargetCompletionDate}
        disabled={readOnly}
        name={assessmentFormConfig.TargetCompletionDate.fieldId}
        label={assessmentFormConfig.TargetCompletionDate.formLabel}
        description={st('TargetCompletionDate_help')}
        control={control}
      />

      <ControlledDatePicker
        key={'actual-completion-date'}
        testId={TestIds.ActualCompletionDate}
        disabled={readOnly}
        name={assessmentFormConfig.ActualCompletionDate.fieldId}
        label={assessmentFormConfig.ActualCompletionDate.formLabel}
        description={st('ActualCompletionDate_help')}
        control={control}
      />

      <ControlledDatePicker
        key={'next-test-date'}
        testId={TestIds.NextTestDate}
        disabled={readOnly}
        name={assessmentFormConfig.NextTestDate.fieldId}
        label={assessmentFormConfig.NextTestDate.formLabel}
        description={st('NextTestDate_help')}
        control={control}
      />

      <ControlledRadioGroup
        key={'status'}
        testId={TestIds.Status}
        forceRequired={true}
        label={assessmentFormConfig.Status.formLabel}
        description={st('Status_help')}
        name={assessmentFormConfig.Status.fieldId}
        control={control}
        items={statusTypesOptions}
        transform={noTransform}
        disabled={readOnly}
      />

      <ControlledRating
        forceRequired={false}
        testId={'assessmentOutcome'}
        key={'outcome'}
        name={assessmentFormConfig.Outcome.fieldId}
        label={assessmentFormConfig.Outcome.formLabel}
        type={assessmentFormConfig.Outcome.displayType.ratingKey}
        description={st('Outcome_help')}
        placeholder={st('Outcome_placeholder')}
        control={control}
        addEmptyOption={true}
        disabled={readOnly}
      />

      <FormRow key={'owners'}>
        <ControlledGroupAndUserContributorMultiSelect
          forceRequired={true}
          includeGroups={true}
          testId={TestIds.Owners}
          control={control}
          label={assessmentFormConfig.Owners.formLabel}
          inheritedContributorsName={'ancestorContributors'}
          contributorType={Contributor_Type_Enum.Owner}
          name={assessmentFormConfig.Owners.fieldId}
          placeholder={t('fields.Owner_placeholder')}
          description={st('Owner_help')}
          disabled={readOnly}
          disabledOptions={disabledUsers}
        />
      </FormRow>

      <FormRow key={'contributors'}>
        <ControlledGroupAndUserContributorMultiSelect
          key={'contributors'}
          testId={'contributors'}
          control={control}
          includeGroups={true}
          inheritedContributorsName={'ancestorContributors'}
          contributorType={Contributor_Type_Enum.Contributor}
          label={assessmentFormConfig.Contributors.formLabel}
          name={assessmentFormConfig.Contributors.fieldId}
          placeholder={t('fields.Contributor_placeholder')}
          description={st('Contributor_help')}
          disabled={readOnly}
        />
      </FormRow>

      <FormRow size={'xl'} key={'tags'}>
        <TagSelector
          testId={'tags'}
          label={assessmentFormConfig.tags.formLabel}
          disabled={readOnly}
          name={assessmentFormConfig.tags.fieldId}
          control={control}
        />
      </FormRow>

      <DepartmentSelector
        label={assessmentFormConfig.departments.formLabel}
        key={'departments'}
        testId={'departments'}
        disabled={readOnly}
        name={assessmentFormConfig.departments.fieldId}
        control={control}
      />
    </CustomisableFieldWrapper>
  );
};

export default ComplianceMonitoringAssessmentFormFields;
