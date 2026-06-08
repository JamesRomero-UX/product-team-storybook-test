import type { Version_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Contributor_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledDocumentMultiselect from 'src/components/form/controlled-document-multiselect';
import ControlledDocumentSelect from 'src/components/form/controlled-document-select';
import ControlledGroupAndUserContributorMultiSelect from 'src/components/form/controlled-group-and-user-contributor-multi-select';
import ControlledInput from 'src/components/form/controlled-input';
import ControlledRadioGroup from 'src/components/form/controlled-radio-group';
import { noTransform } from 'src/components/form/controlled-radio-group/radioGroupUtils';
import ControlledTextarea from 'src/components/form/controlled-textarea';
import DepartmentSelector from 'src/components/form/department-selector';
import CustomisableFieldWrapper from 'src/components/form/form/customisable-form/CustomisableFieldWrapper';
import TagSelector from 'src/components/form/tag-selector';
import TestScheduleFields from 'src/pages/controls/update/forms/TestScheduleFields';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import { useFormConfig } from '../../../../utils/table/hooks/form/useFormConfig';
import AttestationFormFieldsContainer from './AttestationFormFieldsContainer';
import type { DocumentFormFieldData } from './documentSchema';

type Props = {
  readOnly?: boolean;
  documentId?: string;
  docVersionStatus?: Version_Status_Enum;
  latestTestDate?: null | string;
};

const DocumentFormFields: FC<Props> = ({
  readOnly,
  documentId,
  latestTestDate,
}) => {
  const { control } = useFormContext<DocumentFormFieldData>();
  const { t: st } = useTranslation(['common'], { keyPrefix: 'policy' });
  const types = st('types', { returnObjects: true });
  const typeOptions = Object.keys(types).map((key) => ({
    value: key,
    label: types[key as keyof typeof types],
  }));

  const { t } = useTranslation(['common']);
  const attestationsEnabled = useIsModuleEnabled(
    'document.subModules.attestation'
  );
  const attestationImprovementsEnabled = useIsFeatureFlagEnabled(
    'attestation_improvements'
  );
  const formConfig = useFormConfig('document');

  return (
    <CustomisableFieldWrapper readOnly={readOnly}>
      <ControlledInput
        key={'title'}
        forceRequired={true}
        name={formConfig.Title.fieldId}
        testId={'title'}
        label={formConfig.Title.formLabel}
        description={st('fields.Title_help')}
        control={control}
        placeholder={st('fields.Title_placeholder') ?? ''}
        disabled={readOnly}
      />

      <ControlledTextarea
        key={'purpose'}
        name={formConfig.Purpose.fieldId}
        testId={'purpose'}
        label={formConfig.Purpose.formLabel}
        description={st('fields.Purpose_help')}
        placeholder={st('fields.Purpose_placeholder') ?? ''}
        control={control}
        disabled={readOnly}
      />

      <ControlledDocumentSelect
        key={'parentDocument'}
        name={formConfig.ParentDocument.fieldId}
        description={st('fields.Parent_help')}
        label={formConfig.ParentDocument.formLabel}
        control={control}
        testId={'parentDocument'}
        excludedIds={documentId ? [documentId] : []}
        disabled={readOnly}
      />

      <ControlledRadioGroup
        key={'documentType'}
        forceRequired={true}
        description={st('fields.DocumentType_help')}
        label={formConfig.DocumentType.formLabel}
        name={formConfig.DocumentType.fieldId}
        control={control}
        items={typeOptions}
        transform={noTransform}
        disabled={readOnly}
        testId={'type'}
      />

      <ControlledDocumentMultiselect
        key={'linkedDocuments'}
        testId={'linkedDocuments'}
        description={st('fields.LinkedDocuments_help')}
        label={formConfig.linkedDocuments.formLabel}
        name={formConfig.linkedDocuments.fieldId}
        control={control}
        excludedIds={documentId ? [documentId] : []}
        disabled={readOnly}
      />

      <ControlledGroupAndUserContributorMultiSelect
        key={'owners'}
        control={control}
        description={st('fields.Owner_help')}
        includeGroups={true}
        inheritedContributorsName={'ancestorContributors'}
        contributorType={Contributor_Type_Enum.Owner}
        label={formConfig.Owners.formLabel}
        name={formConfig.Owners.fieldId}
        forceRequired={true}
        placeholder={t('fields.Owner_placeholder')}
        disabled={readOnly}
        testId={'owners'}
      />

      <ControlledGroupAndUserContributorMultiSelect
        key={'contributors'}
        testId={'contributors'}
        control={control}
        includeGroups={true}
        contributorType={Contributor_Type_Enum.Contributor}
        inheritedContributorsName={'ancestorContributors'}
        label={formConfig.Contributors.formLabel}
        name={formConfig.Contributors.fieldId}
        placeholder={t('fields.Contributor_placeholder')}
        description={st('fields.Contributor_help')}
        disabled={readOnly}
      />

      <TagSelector
        key={'tags'}
        label={formConfig.tags.formLabel}
        name={formConfig.tags.fieldId}
        testId={'tags'}
        control={control}
        disabled={readOnly}
      />
      <DepartmentSelector
        key={'departments'}
        name={formConfig.departments.fieldId}
        label={formConfig.departments.formLabel}
        testId={'departments'}
        control={control}
        disabled={readOnly}
      />

      <TestScheduleFields
        key={'testConfigFields'}
        control={control}
        readOnly={false}
        latestTestDate={latestTestDate ?? null}
        manualNextTestDueName={'schedule.ManualDueDate'}
        testFrequencyName={'schedule.Frequency'}
        testTimeToCompleteValueName={'schedule.TimeToCompleteValue'}
        testScheduleStartDateName={'schedule.StartDate'}
        testTimeToCompleteUnitName={'schedule.TimeToCompleteUnit'}
      />

      {attestationsEnabled && !attestationImprovementsEnabled && (
        <AttestationFormFieldsContainer
          key={'attestationFields'}
          displayReAttestationRequiredControl={false}
        />
      )}
    </CustomisableFieldWrapper>
  );
};

export default DocumentFormFields;
