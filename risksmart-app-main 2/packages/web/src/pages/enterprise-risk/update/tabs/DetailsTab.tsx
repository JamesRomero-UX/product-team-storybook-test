import { useMutation } from '@apollo/client';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  namedOperations,
  UpdateEnterpriseRiskDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import { useGetEnterpriseRiskById } from 'src/hooks/queries/enterprise-risk/useGetEnterpriseRiskById';
import RiskForm from 'src/pages/risks/forms/RiskForm';
import type { RiskFormDataFields } from 'src/pages/risks/forms/riskSchema';
import { defaultValues } from 'src/pages/risks/forms/riskSchema';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { evictField } from '@/utils/graphqlUtils';

const Tab: FC = () => {
  useI18NSummaryHelpContent('enterpriseRisks.help');
  const id = useGetGuidParam('id');
  const navigate = useNavigate();
  const { data, loading: loadingEnterpriseRisk } = useGetEnterpriseRiskById({
    queryArgs: { id },
  });

  const enterpriseRisk = data?.enterprise_risk[0];

  const {
    hasPermission: canEditEnterpriseRisk,
    loading: canEditEnterpriseRiskLoading,
  } = useHasPermissionQuery('update:enterprise_risk');

  const [updateEnterpriseRisk] = useMutation(UpdateEnterpriseRiskDocument, {
    update: (cache) => {
      evictField(cache, 'enterprise_risk');
    },
    refetchQueries: [
      namedOperations.Query.getEnterpriseRiskById,
      namedOperations.Query.getEnterpriseRisks,
    ],
  });

  const onSave = async (riskFormData: RiskFormDataFields) => {
    if (!id) {
      throw new Error('Missing enterprise risk');
    }
    await updateEnterpriseRisk({
      variables: {
        Id: id,
        Tier: riskFormData.Tier,
        Title: riskFormData.Title,
        Description: riskFormData.Description,
        Treatment: riskFormData.Treatment,
        CustomAttributeData: riskFormData.CustomAttributeData ?? null,
        ParentId: riskFormData.ParentRiskId ?? null,
      },
    });
  };
  const onDismiss = () => navigate(-1);

  return (
    <>
      <RiskForm
        enterpriseRisk
        onSave={onSave}
        onDismiss={onDismiss}
        values={{
          ...defaultValues,
          ...enterpriseRisk,
          Description: enterpriseRisk?.Description ?? '',
          Tier: enterpriseRisk?.Tier as 1 | 2 | 3,
        }}
        readOnly={
          !canEditEnterpriseRisk ||
          canEditEnterpriseRiskLoading ||
          loadingEnterpriseRisk
        }
        riskId={id}
      />
    </>
  );
};

export default Tab;
