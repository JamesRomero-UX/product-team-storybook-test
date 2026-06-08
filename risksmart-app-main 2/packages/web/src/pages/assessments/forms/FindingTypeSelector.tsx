import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { capitalize } from 'lodash';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'src/components/form/select';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import type { FormType } from './types';

interface Props {
  readOnly: boolean;
  onChange?: (val: FormType) => void;
  parent?: ObjectWithContributors;
  value?: FormType;
  testId?: string;
}

const FindingTypeSelector: FC<Props> = ({
  readOnly,
  onChange,
  parent,
  value,
  testId,
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'assessmentResults.fields',
  });
  const { t: tc } = useTranslation('common');
  const { t: tt } = useTranslation('taxonomy');

  const policyModuleEnabled = useIsModuleEnabled('document');
  const complianceModuleEnabled = useIsModuleEnabled('obligation');

  const {
    hasPermission: canCreateDocumentAssessmentResult,
    loading: canCreateDocumentLoading,
  } = useHasPermissionQuery('insert:document_assessment_result', parent);
  const {
    hasPermission: canCreateObligationAssessmentResult,
    loading: canCreateObligationLoading,
  } = useHasPermissionQuery('insert:obligation_assessment_result', parent);
  const {
    hasPermission: canCreateRiskAssessmentResult,
    loading: canCreateRiskLoading,
  } = useHasPermissionQuery('insert:risk_assessment_result', parent);
  const {
    hasPermission: canCreateControlTestResult,
    loading: canCreateControlLoading,
  } = useHasPermissionQuery('insert:test_result', parent);

  const canCreateRating =
    (canCreateDocumentAssessmentResult &&
      !canCreateDocumentLoading &&
      policyModuleEnabled) ||
    (canCreateRiskAssessmentResult && !canCreateRiskLoading) ||
    (canCreateObligationAssessmentResult &&
      !canCreateObligationLoading &&
      complianceModuleEnabled) ||
    (canCreateControlTestResult && !canCreateControlLoading);
  const { hasPermission: canCreateAction, loading: canCreateActionLoading } =
    useHasPermissionQuery('insert:action', parent);

  const { hasPermission: canCreateIssue, loading: canCreateIssueLoading } =
    useHasPermissionQuery('insert:issue', parent);

  const options = [];

  if (canCreateRating) {
    options.push({
      value: 'rating',
      label: capitalize(tt('rating_one')),
    });
  }

  if (canCreateAction && !canCreateActionLoading) {
    options.push({
      value: Parent_Type_Enum.Action,
      label: capitalize(tt('action_one')),
    });
  }

  if (canCreateIssue && !canCreateIssueLoading) {
    options.push({
      value: Parent_Type_Enum.Issue,
      label: capitalize(tt('issue_one')),
    });
  }

  return (
    <FormField label={t('Type')} data-testid={`form-field-${testId}`}>
      <Select
        disabled={readOnly || options.length === 1}
        onChange={(e) => onChange?.(e.detail.selectedOption.value as FormType)}
        options={options}
        selectedOption={options.find((o) => o.value === value) || null}
        placeholder={t('Type_placeholder')}
        empty={tc('noMatchedFound')}
      />
    </FormField>
  );
};

export default FindingTypeSelector;
