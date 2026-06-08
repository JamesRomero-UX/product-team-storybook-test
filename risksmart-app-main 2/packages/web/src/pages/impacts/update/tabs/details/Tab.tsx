import { useMutation } from '@apollo/client';
import type { GetImpactByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { UpdateImpactDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ownerIds } from 'src/components/form';
import { PageWrapper } from 'src/components/form/form/PageWrapper';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import { getOwners } from 'src/rbac/contributorHelper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { evictField } from '@/utils/graphqlUtils';

import ImpactForm from '../../forms/ImpactForm';
import type { ImpactFormFieldData } from '../../forms/impactFormSchema';
import { defaultValues } from '../../forms/impactFormSchema';

type Props = {
  impact: GetImpactByIdQuery['impact'][number];
};

const Tab: FC<Props> = ({ impact }) => {
  useI18NSummaryHelpContent('impacts.detailsHelp');
  const { hasPermission: canUpdateImpact, loading: canUpdateImpactLoading } =
    useHasPermissionQuery('update:impact', impact);
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const [updateImpact] = useMutation(UpdateImpactDocument, {
    update: (cache) => {
      evictField(cache, 'impact');
      evictField(cache, 'impact_rating');
    },
  });

  const onSave = async (data: ImpactFormFieldData) => {
    if (!impact) {
      throw new Error('Missing impact data');
    }
    await updateImpact({
      variables: {
        object: {
          Id: impact.Id,
          RatingGuidance: data.RatingGuidance,
          Rationale: data.Rationale,
          Name: data.Name,
          LikelihoodAppetite: data.LikelihoodAppetite,
          ...ownerIds(data),
        },
      },
    });
  };

  const onDismiss = () => navigate(-1);

  return (
    <ImpactForm
      onDismiss={onDismiss}
      header={t('details')}
      readOnly={!canUpdateImpact || canUpdateImpactLoading}
      onSave={onSave}
      values={{
        ...defaultValues,
        ...impact,
        Owners: getOwners(impact),
      }}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    />
  );
};

export default Tab;
