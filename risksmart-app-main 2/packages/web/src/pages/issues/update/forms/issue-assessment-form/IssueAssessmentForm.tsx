import Header from '@risk-smart/themed-cloudscape-components/header';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import { Issue_Assessment_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC, useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledControlMultiSelect from 'src/components/form/controlled-control-multi-select';
import ControlledDatePicker from 'src/components/form/controlled-date-picker';
import ControlledDocumentMultiselect from 'src/components/form/controlled-document-multiselect';
import ControlledGroupAndUserSelect from 'src/components/form/controlled-group-and-user-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledObligationMultiselect from 'src/components/form/controlled-obligation-multiselect';
import ControlledRadioGroup from 'src/components/form/controlled-radio-group';
import { ControlledBooleanRadioGroup } from 'src/components/form/controlled-radio-group/ControlledBooleanRadioGroup';
import { noTransform } from 'src/components/form/controlled-radio-group/radioGroupUtils';
import { yesNoOptions } from 'src/components/form/controlled-radio-group/radioGroupUtils';
import ControlledRating from 'src/components/form/controlled-rating';
import ControlledSelect from 'src/components/form/controlled-select';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import DepartmentSelector from 'src/components/form/department-selector';
import ConditionalField from 'src/components/form/form/customisable-form/ConditionalField';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import FieldGroup from 'src/components/form/form/customisable-form/FieldGroup';
import { useCustomisableFormDataContext } from 'src/components/form/form/customisable-form-data/CustomisableFormDataContext';
import TagSelector from 'src/components/form/tag-selector';
import type { IssueAssessmentFields } from 'src/pages/issues/update/forms/issue-assessment-form/issueAssessmentSchema';
import { useFormConfig } from 'src/utils/table/hooks/form/useFormConfig';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';

type Props = {
  readOnly?: boolean;
  type: ParentIssueType;
};

const IssueAssessmentForm: FC<Props> = ({ readOnly, type }) => {
  const issueTypeMapping = IssueTypeMapping[type];
  const { options } = useRating('issue_assessment_status');
  const issueStatusOptions = options
    .filter(
      (option) =>
        option.value &&
        Object.values(Issue_Assessment_Status_Enum).includes(
          option.value as Issue_Assessment_Status_Enum
        )
    )
    .map((option) => ({
      ...option,
      value: String(option.value),
    }));
  const { control } = useFormContext<IssueAssessmentFields>();
  const { t: st } = useTranslation(['common'], {
    keyPrefix: issueTypeMapping.assessmentTaxonomy,
  });
  const { t } = useTranslation(['common']);
  const isComplianceVisibleToOrg = useIsModuleEnabled('obligation');
  const isPolicyVisibleToOrg = useIsModuleEnabled('document');
  const turnOffRegulatoryBreaches = useIsFeatureFlagEnabled(
    'turn-off-regulatory-breaches'
  );
  const issueTypes = t(issueTypeMapping.assessmentRatingTypeTaxonomy);
  const issueTypeKeys = Object.keys(issueTypes) as Array<
    keyof typeof issueTypes
  >;
  const issueTypeOptions = issueTypeKeys.map((key) => ({
    label: String(issueTypes[key]),
    value: key,
  }));
  const status = useWatch({
    control,
    name: 'Status',
  });
  const policyBreach = useWatch({
    control,
    name: 'PolicyBreach',
  });
  const regulatoryBreach = useWatch({
    control,
    name: 'RegulatoryBreach',
  });
  const issueCausedByThirdParty = useWatch({
    control,
    name: 'IssueCausedByThirdParty',
  });
  const issueCausedBySystemIssue = useWatch({
    control,
    name: 'IssueCausedBySystemIssue',
  });
  const issueAssessmentFormConfig = useFormConfig(
    issueTypeMapping.assessmentType
  );
  const { formFieldConfigurations } = useCustomisableFormDataContext();

  const showHeaderForSection = useCallback(
    (controllingFieldId: string): boolean => {
      const fieldConfig = formFieldConfigurations?.find(
        (ffc) => ffc.FieldId === controllingFieldId
      );

      return fieldConfig ? !fieldConfig.Hidden : true;
    },
    [formFieldConfigurations]
  );

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledSelect
        key={'issueType'}
        filteringType={'auto'}
        label={issueAssessmentFormConfig.IssueType.formLabel}
        name={issueAssessmentFormConfig.IssueType.fieldId}
        placeholder={'Select'}
        control={control}
        options={issueTypeOptions}
        disabled={readOnly}
        testId={'issueType'}
        description={st('fields.IssueType_help')}
      />
      <ControlledRating
        key={'severity'}
        addEmptyOption={true}
        filteringType={'none'}
        label={issueAssessmentFormConfig.Severity.formLabel}
        name={issueAssessmentFormConfig.Severity.fieldId}
        type={issueAssessmentFormConfig.Severity.displayType.ratingKey}
        placeholder={t('select') ?? ''}
        control={control}
        disabled={readOnly}
        testId={'severity'}
        description={st('fields.Severity_help')}
      />
      <FieldGroup key={'statusGroup'}>
        <ControlledRadioGroup
          key={'status'}
          label={issueAssessmentFormConfig.Status.formLabel}
          name={issueAssessmentFormConfig.Status.fieldId}
          control={control}
          transform={noTransform}
          items={issueStatusOptions}
          disabled={readOnly}
          testId={'status'}
          description={st('fields.Status_help')}
        />
        <ControlledDatePicker
          key={'targetCloseDate'}
          name={issueAssessmentFormConfig.TargetCloseDate.fieldId}
          label={issueAssessmentFormConfig.TargetCloseDate.formLabel}
          control={control}
          disabled={readOnly}
          testId={'targetCloseDate'}
          description={st('fields.TargetCloseDate_help')}
        />
        <ConditionalField
          condition={status === Issue_Assessment_Status_Enum.Closed}
          key={'actualCloseDate'}
        >
          <ControlledDatePicker
            key={'actualCloseDate'}
            name={issueAssessmentFormConfig.ActualCloseDate.fieldId}
            label={issueAssessmentFormConfig.ActualCloseDate.formLabel}
            control={control}
            disabled={readOnly}
            testId={'actualCloseDate'}
            description={st('fields.ActualCloseDate_help')}
          />
        </ConditionalField>
      </FieldGroup>
      <ControlledControlMultiSelect
        key={'associatedControlId'}
        control={control}
        name={issueAssessmentFormConfig.AssociatedControlIds.fieldId}
        renderTokens={true}
        label={issueAssessmentFormConfig.AssociatedControlIds.formLabel}
        disabled={readOnly}
        description={st('fields.AssociatedControls_help')}
      />

      <ControlledGroupAndUserSelect
        testId={'certifiedIndividual'}
        key={'certifiedIndividual'}
        control={control}
        addEmptyOption={true}
        name={issueAssessmentFormConfig.CertifiedIndividual.fieldId}
        label={issueAssessmentFormConfig.CertifiedIndividual.formLabel}
        disabled={readOnly}
        description={st('fields.CertifiedIndividual_help')}
        includeGroups={false}
      />

      <ConditionalField
        condition={showHeaderForSection(
          issueAssessmentFormConfig.RegulatoryBreach.fieldId
        )}
        key={'regulatoryHeader'}
      >
        <Header variant={'h3'}>{st('headings.regulation')}</Header>
      </ConditionalField>

      <ControlledBooleanRadioGroup
        key={'regulatoryBreach'}
        testId={'regulatoryBreach'}
        label={issueAssessmentFormConfig.RegulatoryBreach.formLabel}
        name={issueAssessmentFormConfig.RegulatoryBreach.fieldId}
        control={control}
        items={yesNoOptions}
        disabled={readOnly}
        description={st('fields.RegulatoryBreach_help')}
      />

      <ConditionalField
        condition={regulatoryBreach}
        key={'regulationsBreached'}
      >
        {isComplianceVisibleToOrg && !turnOffRegulatoryBreaches ? (
          <ControlledObligationMultiselect
            control={control}
            name={issueAssessmentFormConfig.RegulationsBreachedIds.fieldId}
            testId={'regulationsBreachedIds'}
            label={issueAssessmentFormConfig.RegulationsBreachedIds.formLabel}
            placeholder={st('fields.RegulationsBreachedIds_placeholder') ?? ''}
            description={st('fields.RegulationsBreached_help')}
            disabled={readOnly}
          />
        ) : (
          <ControlledInput
            name={issueAssessmentFormConfig.RegulationsBreached.fieldId}
            testId={'regulationsBreached'}
            label={issueAssessmentFormConfig.RegulationsBreached.formLabel}
            placeholder={st('fields.RegulationsBreached_placeholder') ?? ''}
            description={st('fields.RegulationsBreached_help')}
            control={control}
            disabled={readOnly}
          />
        )}
      </ConditionalField>

      <ConditionalField condition={regulatoryBreach} key={'reportable'}>
        <ControlledBooleanRadioGroup
          label={issueAssessmentFormConfig.Reportable.formLabel}
          name={issueAssessmentFormConfig.Reportable.fieldId}
          testId={'reportable'}
          control={control}
          items={yesNoOptions}
          disabled={readOnly}
          description={st('fields.Reportable_help')}
        />
      </ConditionalField>

      <ConditionalField condition={regulatoryBreach} key={'rationale'}>
        <ControlledTextarea
          name={issueAssessmentFormConfig.Rationale.fieldId}
          testId={'rationale'}
          label={issueAssessmentFormConfig.Rationale.formLabel}
          placeholder={st('fields.Rationale_placeholder') ?? ''}
          control={control}
          disabled={readOnly}
          description={st('fields.Rationale_help')}
        />
      </ConditionalField>

      <ConditionalField
        condition={showHeaderForSection(
          issueAssessmentFormConfig.IssueCausedByThirdParty.fieldId
        )}
        key={'thirdPartyHeader'}
      >
        <Header variant={'h3'}>{st('headings.thirdParty')}</Header>
      </ConditionalField>

      <ControlledBooleanRadioGroup
        key={'issueCausedByThirdParty'}
        testId={'issueCausedByThirdParty'}
        label={issueAssessmentFormConfig.IssueCausedByThirdParty.formLabel}
        name={issueAssessmentFormConfig.IssueCausedByThirdParty.fieldId}
        control={control}
        items={yesNoOptions}
        disabled={readOnly}
        description={st('fields.IssueCausedByThirdParty_help')}
      />

      <ConditionalField
        key={'thirdPartyResponsible'}
        condition={issueCausedByThirdParty}
      >
        <ControlledInput
          name={issueAssessmentFormConfig.ThirdPartyResponsible.fieldId}
          label={issueAssessmentFormConfig.ThirdPartyResponsible.formLabel}
          testId={'thirdPartyResponsible'}
          placeholder={st('fields.ThirdPartyResponsible_placeholder') ?? ''}
          control={control}
          disabled={readOnly}
          description={st('fields.ThirdPartyResponsible_help')}
        />
      </ConditionalField>

      <ConditionalField
        condition={showHeaderForSection(
          issueAssessmentFormConfig.IssueCausedBySystemIssue.fieldId
        )}
        key={'systemHeader'}
      >
        <Header variant={'h3'}>{st('headings.system')}</Header>
      </ConditionalField>

      <ControlledBooleanRadioGroup
        key={'issueCausedBySystemIssue'}
        testId={'issueCausedBySystemIssue'}
        label={issueAssessmentFormConfig.IssueCausedBySystemIssue.formLabel}
        name={issueAssessmentFormConfig.IssueCausedBySystemIssue.fieldId}
        control={control}
        items={yesNoOptions}
        disabled={readOnly}
        description={st('fields.IssueCausedBySystemIssue_help')}
      />
      <ConditionalField
        condition={issueCausedBySystemIssue}
        key={'systemResponsible'}
      >
        <ControlledInput
          name={issueAssessmentFormConfig.SystemResponsible.fieldId}
          label={issueAssessmentFormConfig.SystemResponsible.formLabel}
          testId={'systemResponsible'}
          placeholder={st('fields.SystemResponsible_placeholder') ?? ''}
          description={st('fields.SystemResponsible_help')}
          control={control}
          disabled={readOnly}
        />
      </ConditionalField>

      <ConditionalField
        condition={showHeaderForSection(
          issueAssessmentFormConfig.PolicyBreach.fieldId
        )}
        key={'policyHeader'}
      >
        <Header variant={'h3'}>{st('headings.policy')}</Header>
      </ConditionalField>

      <ControlledBooleanRadioGroup
        testId={'policyBreached'}
        key={'policyBreach'}
        label={issueAssessmentFormConfig.PolicyBreach.formLabel}
        name={issueAssessmentFormConfig.PolicyBreach.fieldId}
        control={control}
        items={yesNoOptions}
        disabled={readOnly}
        description={st('fields.PolicyBreach_help')}
      />

      <ConditionalField condition={policyBreach} key={'policiesBreached'}>
        {isPolicyVisibleToOrg ? (
          <ControlledDocumentMultiselect
            name={issueAssessmentFormConfig.PoliciesBreachedIds.fieldId}
            testId={'policiesBreachedIds'}
            label={issueAssessmentFormConfig.PoliciesBreachedIds.formLabel}
            placeholder={st('fields.PoliciesBreached_placeholder') ?? ''}
            control={control}
            disabled={readOnly}
            description={st('fields.PoliciesBreached_help')}
          />
        ) : (
          <ControlledInput
            name={issueAssessmentFormConfig.PoliciesBreached.fieldId}
            testId={'policiesBreached'}
            label={issueAssessmentFormConfig.PoliciesBreached.formLabel}
            placeholder={st('fields.PoliciesBreached_placeholder') ?? ''}
            control={control}
            disabled={readOnly}
            description={st('fields.PoliciesBreached_help')}
          />
        )}
      </ConditionalField>
      <ConditionalField condition={policyBreach} key={'policyOwner'}>
        <ControlledGroupAndUserSelect
          control={control}
          addEmptyOption={true}
          name={issueAssessmentFormConfig.PolicyOwner.fieldId}
          testId={'policyOwner'}
          label={issueAssessmentFormConfig.PolicyOwner.formLabel}
          disabled={readOnly}
          includeGroups={false}
          description={st('fields.PolicyOwner_help')}
        />
      </ConditionalField>
      <ConditionalField condition={policyBreach} key={'policyOwnerCommentary'}>
        <ControlledTextarea
          testId={'policyOwnerCommentary'}
          name={issueAssessmentFormConfig.PolicyOwnerCommentary.fieldId}
          label={issueAssessmentFormConfig.PolicyOwnerCommentary.formLabel}
          placeholder={st('fields.PolicyOwnerCommentary_placeholder') ?? ''}
          control={control}
          disabled={readOnly}
          description={st('fields.PolicyOwnerCommentary_help')}
        />
      </ConditionalField>

      <TagSelector
        name={issueAssessmentFormConfig.tags.fieldId}
        label={issueAssessmentFormConfig.tags.formLabel}
        key={'tags'}
        testId={'tags'}
        control={control}
        disabled={readOnly}
      />
      <DepartmentSelector
        key={'departments'}
        label={issueAssessmentFormConfig.departments.formLabel}
        name={issueAssessmentFormConfig.departments.fieldId}
        testId={'departments'}
        control={control}
        disabled={readOnly}
      />
    </CustomisableFieldWrapper>
  );
};

export default IssueAssessmentForm;
