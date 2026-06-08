import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { capitalize } from 'lodash';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'src/components/form/select';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import type { RatingResultType } from './types';

interface Props {
  readOnly: boolean;
  onChange?: (val: RatingResultType) => void;
  parent?: ObjectWithContributors;
  value?: RatingResultType;
  testId?: string;
}

const RatingTypeSelector: FC<Props> = ({
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
  const impactsEnabled = useIsModuleEnabled('risk.subModules.impact');

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

  const {
    hasPermission: canCreateImpactRating,
    loading: canCreateImpactLoading,
  } = useHasPermissionQuery('insert:impact_rating', parent);

  const options = [];

  if (
    canCreateRiskAssessmentResult &&
    !canCreateRiskLoading &&
    !impactsEnabled
  ) {
    options.push({
      value: Parent_Type_Enum.RiskAssessmentResult,
      label: capitalize(tt('risk_one')),
    });
  }

  if (
    canCreateDocumentAssessmentResult &&
    !canCreateDocumentLoading &&
    policyModuleEnabled
  ) {
    options.push({
      value: Parent_Type_Enum.DocumentAssessmentResult,
      label: capitalize(tt('document_one')),
    });
  }

  if (
    canCreateObligationAssessmentResult &&
    !canCreateObligationLoading &&
    complianceModuleEnabled
  ) {
    options.push({
      value: Parent_Type_Enum.ObligationAssessmentResult,
      label: capitalize(tt('obligation_one')),
    });
  }

  if (canCreateControlTestResult && !canCreateControlLoading) {
    options.push({
      value: Parent_Type_Enum.TestResult,
      label: capitalize(tt('control_one')),
    });
  }

  if (canCreateImpactRating && !canCreateImpactLoading && impactsEnabled) {
    options.push({
      value: Parent_Type_Enum.ImpactRating,
      label: capitalize(tt('impact_one')),
    });
  }

  return (
    <FormField label={t('RatingType')} data-testid={`form-field-${testId}`}>
      <Select
        disabled={readOnly || options.length === 1}
        onChange={(e) =>
          onChange?.(e.detail.selectedOption.value as RatingResultType)
        }
        options={options}
        selectedOption={options.find((o) => o.value === value) || null}
        placeholder={t('RatingType_placeholder')}
        empty={tc('noMatchedFound')}
      />
    </FormField>
  );
};

export default RatingTypeSelector;
