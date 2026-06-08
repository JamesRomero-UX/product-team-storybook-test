import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledRiskMultiSelect from 'src/components/form/controlled-risk-multi-select';
import type { LinkedItemFields } from 'src/schemas/linkedItemSchema';

import { RiskAssessmentResultTestIds } from '../../assessments/forms/RiskAssessmentResultTestIds';
interface Props {
  excludedRiskIds?: string[];
}
const LinkRisksForm: FC<Props> = ({ excludedRiskIds }) => {
  const { control } = useFormContext<LinkedItemFields>();
  const { t } = useTranslation('common', {
    keyPrefix: 'internalAudits',
  });

  return (
    <ControlledRiskMultiSelect
      defaultRequired={true}
      key={'RiskIds'}
      testId={RiskAssessmentResultTestIds.Risk}
      control={control}
      label={t('linkRisksModal.risks')}
      name={'Target'}
      excludedIds={excludedRiskIds}
    />
  );
};

export default LinkRisksForm;
