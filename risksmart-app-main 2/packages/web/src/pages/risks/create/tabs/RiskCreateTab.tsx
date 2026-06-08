import type { FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import type { RiskFormDataFields } from 'src/pages/risks/forms/riskSchema';

import { useInsertRisk } from '@/hooks/mutations';
import { riskDetailsUrl } from '@/utils/urls';

import RiskForm from '../../forms/RiskForm';

const RiskCreateTab: FC = () => {
  useI18NSummaryHelpContent('risks.help');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tierParam = searchParams.get('tier');

  const { insertRisk } = useInsertRisk();

  const onSave = async (riskFormData: RiskFormDataFields) => {
    const data = await insertRisk({
      DepartmentTypeIds:
        riskFormData.departments?.map((d) => d.DepartmentTypeId) || [],
      TagTypeIds: riskFormData.tags?.map((t) => t.TagTypeId) || [],
      Tier: riskFormData.Tier,
      Title: riskFormData.Title,
      Description: riskFormData.Description,
      Treatment: riskFormData.Treatment,
      Status: riskFormData.Status,
      CustomAttributeData: riskFormData.CustomAttributeData ?? null,
      ParentRiskId: riskFormData.ParentRiskId ?? null,
      schedule: riskFormData.schedule,
      ...ownerAndContributorIds(riskFormData),
    });
    if (data?.insertChildRisk?.Id) {
      navigate(riskDetailsUrl(data?.insertChildRisk?.Id), { replace: true });
    }
  };

  const onDismiss = (saved?: boolean) => {
    if (!saved) {
      navigate(-1);
    }
  };

  return (
    <RiskForm
      onSave={onSave}
      onDismiss={onDismiss}
      initialTier={tierParam ? Number(tierParam) : undefined}
    />
  );
};

export default RiskCreateTab;
