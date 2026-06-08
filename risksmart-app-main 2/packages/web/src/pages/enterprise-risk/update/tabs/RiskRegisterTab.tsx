import { useQuery } from '@apollo/client';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import {
  GetAppetitesGroupedByImpactDocument,
  GetRisksFlatDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import AssessmentResultModal from 'src/pages/assessments/modals/AssessmentResultModal';
import { useGetCollectionTableProps } from 'src/pages/risks/config';

import { useRiskScores } from '@/hooks/useRiskScore';

const Tab: FC = () => {
  useI18NSummaryHelpContent('enterpriseRisks.help');
  const id = useGetGuidParam('id');
  const { t } = useTranslation(['common'], {});

  const { data, loading, error, refetch } = useQuery(GetRisksFlatDocument, {
    variables: {
      where: { enterpriseRiskInstance: { EnterpriseRiskId: { _eq: id } } },
    },
    fetchPolicy: 'no-cache',
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [openRatingResultId, setOpenRatingResultId] = useState<
    string | undefined
  >();
  const handleRatingResultModalClose = () => {
    setOpenRatingResultId(undefined);
    setIsEditOpen(false);
    refetch();
  };

  const { loading: loadingScores, scores } = useRiskScores();

  const { data: impactAppetites, loading: loadingImpactAppetites } = useQuery(
    GetAppetitesGroupedByImpactDocument
  );

  const tableProps = useGetCollectionTableProps(
    data?.risk,
    scores,
    impactAppetites?.impact,
    (ratingId) => {
      setOpenRatingResultId(ratingId);
      setIsEditOpen(true);
    }
  );

  if (error) {
    throw error;
  }

  return (
    <>
      <Table
        {...tableProps}
        loading={loading || loadingScores || loadingImpactAppetites}
        variant={'embedded'}
      />
      {isEditOpen && (
        <AssessmentResultModal
          id={openRatingResultId}
          onDismiss={handleRatingResultModalClose}
          resultType={Parent_Type_Enum.RiskAssessmentResult}
          hideTypeSelector={true}
          i18n={t('ratings')}
          assessmentMode={'rating'}
        />
      )}
    </>
  );
};

export default Tab;
