import { useMutation } from '@apollo/client';
import {
  InsertEnterpriseRiskDocument,
  namedOperations,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import RiskForm from 'src/pages/risks/forms/RiskForm';
import type { RiskFormDataFields } from 'src/pages/risks/forms/riskSchema';

import { evictField } from '@/utils/graphqlUtils';
import { enterpriseRiskDetailsUrl } from '@/utils/urls';

const EnterpriseRiskCreateTab: FC = () => {
  useI18NSummaryHelpContent('enterpriseRisks.help');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tierParam = searchParams.get('tier');

  const [mutate] = useMutation(InsertEnterpriseRiskDocument, {
    update: (cache) => {
      evictField(cache, 'enterprise_risk');
    },
    refetchQueries: [
      namedOperations.Query.getEnterpriseRiskById,
      namedOperations.Query.getEnterpriseRisksFlat,
      namedOperations.Query.getEnterpriseRisksByTier,
      namedOperations.Query.getEnterpriseRisks,
    ],
  });

  const onSave = async (riskFormData: RiskFormDataFields) => {
    const { data } = await mutate({
      variables: {
        Tier: riskFormData.Tier,
        Title: riskFormData.Title,
        Description: riskFormData.Description,
        Treatment: riskFormData.Treatment,
        CustomAttributeData: riskFormData.CustomAttributeData ?? null,
        ParentId: riskFormData.ParentRiskId ?? null,
      },
    });
    if (data?.insertChildEnterpriseRisk?.Id) {
      navigate(enterpriseRiskDetailsUrl(data?.insertChildEnterpriseRisk?.Id), {
        replace: true,
      });
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
      enterpriseRisk
    />
  );
};

export default EnterpriseRiskCreateTab;
