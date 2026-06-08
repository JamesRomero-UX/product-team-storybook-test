import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'src/components/form/select';

import { useIsFeatureFlagEnabledLazy } from '@/hooks/useIsFeatureFlagEnabled';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';

interface Props {
  readOnly: boolean;
  onChange?: (val: ParentIssueType) => void;
  value?: ParentIssueType;
  testId?: string;
}

const IssueTypeSelector: FC<Props> = ({
  readOnly,
  onChange,
  value,
  testId,
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'issues.fields',
  });
  const isFeatureFlagEnabled = useIsFeatureFlagEnabledLazy();
  const { t: tc } = useTranslation('common');

  const issueTypeOptions = Object.entries(IssueTypeMapping)
    .map(([type, itm]) => ({
      value: type,
      label: tc(`${itm.taxonomy}.fallback_title`),
      hasAccess: () =>
        itm.featureFlag ? isFeatureFlagEnabled(itm.featureFlag) : true,
    }))
    .filter((a) => a.hasAccess());

  return issueTypeOptions.length > 1 ? (
    <FormField
      stretch={true}
      label={t('IssueType')}
      data-testid={`form-field-${testId}`}
    >
      <Select
        disabled={readOnly || issueTypeOptions.length === 1}
        onChange={(e) =>
          onChange?.(e.detail.selectedOption.value as ParentIssueType)
        }
        options={issueTypeOptions}
        selectedOption={issueTypeOptions.find((o) => o.value === value) || null}
        placeholder={t('IssueType_placeholder')}
        empty={tc('noMatchedFound')}
      />
    </FormField>
  ) : (
    <></>
  );
};

export default IssueTypeSelector;
